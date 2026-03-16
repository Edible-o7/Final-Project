<script setup lang="ts">
import type { User } from '../stores/auth'

const props = defineProps<{ users: User[] }>()
const emit = defineEmits<{
  (e: 'edit', user: User): void
  (e: 'delete', user: User): void
}>()
</script>

<template>
  <table class="table is-fullwidth is-striped is-hoverable">
    <thead>
      <tr>
        <th>Name</th>
        <th>Username</th>
        <th>Role</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in props.users" :key="user.id">
        <td>{{ user.name }}</td>
        <td>{{ user.username }}</td>
        <td>{{ user.role }}</td>
        <td>
          <button class="button is-small is-info" @click="$emit('edit', user)">Edit</button>
          <button class="button is-small is-danger" @click="$emit('delete', user)">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
