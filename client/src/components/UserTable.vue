<script setup lang="ts">
interface SafeUser {
  id: number | string
  firstName?: string
  lastName?: string
  email?: string
  role?: string
}

const props = defineProps<{ users: SafeUser[] }>()
const emit = defineEmits<{
  (e: 'edit', user: SafeUser): void
  (e: 'delete', user: SafeUser): void
}>()
</script>

<template>
  <table class="table is-fullwidth is-striped is-hoverable">
    <thead>
      <tr>
        <th>Name</th>
        <th>Email</th>
        <th>Role</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in props.users" :key="user.id">
        <td>{{ (user.firstName ?? '') + ' ' + (user.lastName ?? '') }}</td>
        <td>{{ user.email }}</td>
        <td>{{ user.role }}</td>
        <td>
          <button class="button is-small is-info" @click="emit('edit', user)">Edit</button>
          <button class="button is-small is-danger" @click="emit('delete', user)">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
