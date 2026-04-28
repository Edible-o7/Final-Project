-- PostgreSQL schema for the exercise app

-- User roles for access control and admin features
CREATE TYPE user_role AS ENUM ('admin', 'moderator', 'user');

-- Friendship state for friend activity features
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'blocked');

-- Maps to: User
CREATE TABLE users (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name    TEXT        NOT NULL,
    last_name     TEXT        NOT NULL,
    email         TEXT        NOT NULL UNIQUE,
    password_hash TEXT        NOT NULL,
    bio           TEXT,
    avatar_url    TEXT,
    role          user_role   NOT NULL DEFAULT 'user',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Maps to: ExerciseType
CREATE TABLE exercise_types (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name         TEXT        NOT NULL UNIQUE,
    category     TEXT        NOT NULL,
    description  TEXT,
    created_by   BIGINT      REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Maps to: Activity
CREATE TABLE activities (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id           BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_type_id  BIGINT      NOT NULL REFERENCES exercise_types(id) ON DELETE RESTRICT,
    title             TEXT        NOT NULL,
    duration_minutes  INTEGER     NOT NULL CHECK (duration_minutes > 0),
    calories_burned   NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (calories_burned >= 0),
    activity_date     DATE        NOT NULL DEFAULT CURRENT_DATE,
    notes             TEXT,
    is_private        BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Maps to: Friend relationship / friends feed
CREATE TABLE friendships (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    requester_id   BIGINT             NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id   BIGINT             NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status         friendship_status  NOT NULL DEFAULT 'pending',
    created_at     TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    CONSTRAINT friendships_no_self_check CHECK (requester_id <> addressee_id),
    CONSTRAINT friendships_unique_pair UNIQUE (requester_id, addressee_id)
);

-- Helpful indexes for common queries
CREATE INDEX idx_activities_user_date ON activities (user_id, activity_date DESC);
CREATE INDEX idx_activities_exercise_type ON activities (exercise_type_id);
CREATE INDEX idx_friendships_requester ON friendships (requester_id);
CREATE INDEX idx_friendships_addressee ON friendships (addressee_id);
CREATE INDEX idx_friendships_status ON friendships (status);

-- Shared updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Keep timestamps current on updates
CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER exercise_types_set_updated_at
BEFORE UPDATE ON exercise_types
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER activities_set_updated_at
BEFORE UPDATE ON activities
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER friendships_set_updated_at
BEFORE UPDATE ON friendships
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
