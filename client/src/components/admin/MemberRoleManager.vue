<script setup lang="ts">
import { currentUser, roleLabels } from "@/composables/session";
import { useMemberRoles } from "./useMemberRoles";

const { email, users, status, busy, search, changeRole } = useMemberRoles();
</script>

<template>
  <div class="photo-manager">
    <div class="manager-header"><h3>회원 권한 관리</h3></div>
    <form class="member-search" @submit.prevent="search">
      <input v-model="email" type="search" aria-label="이메일" placeholder="이메일 검색" />
      <button class="btn-upload" type="submit" :disabled="busy">검색</button>
    </form>
    <p class="status-message" role="status">{{ status }}</p>
    <div v-if="users.length" class="table-wrapper">
      <table class="table">
        <thead>
          <tr><th scope="col">이메일</th><th scope="col">이름</th><th scope="col">현재 권한</th><th scope="col">변경</th></tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.email }}</td>
            <td>{{ user.name }}</td>
            <td>{{ roleLabels[user.role] }}</td>
            <td>
              <button
                v-if="user.role !== 'admin' && user.id !== currentUser?.id" class="btn-upload"
                type="button" :disabled="busy" @click="changeRole(user)"
              >{{ user.role === "operator" ? "사용자로 변경" : "운영자로 지정" }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.member-search { display: flex; flex-wrap: wrap; gap: 0.75rem; margin: 1rem 0 0.5rem; }
.member-search input {
  flex: 1 1 10rem;
  min-width: 0;
  padding: 0.75rem;
  color: var(--ow-text);
  background: var(--ow-surface);
  border: 1px solid var(--ow-border-solid);
  border-radius: 6px;
}
</style>
