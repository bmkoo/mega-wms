<template>
  <div class="login">
    <div class="login__card">
      <div class="login__brand">
        <img :src="iconUrl" alt="i-WMS" class="login__logo" />
        <h1 class="login__title">{{ t('appName') }}</h1>
        <p class="login__desc">{{ t('appDesc') }}</p>
      </div>

      <a-form layout="vertical" @submit.prevent="onLogin">
        <a-form-item :label="t('login') + ' ID'">
          <a-input
            v-model:value="form.loginId"
            size="large"
            placeholder="ID"
            autocomplete="username"
          >
            <template #prefix><UserOutlined /></template>
          </a-input>
        </a-form-item>

        <a-form-item label="PASSWORD">
          <a-input-password
            v-model:value="form.password"
            size="large"
            placeholder="Password"
            autocomplete="current-password"
            @press-enter="onLogin"
          >
            <template #prefix><LockOutlined /></template>
          </a-input-password>
        </a-form-item>

        <a-button type="primary" size="large" block :loading="submitting" @click="onLogin">
          {{ t('login') }}
        </a-button>
      </a-form>

      <a-collapse ghost class="login__server">
        <a-collapse-panel key="server" :header="`${t('common.server')} ${t('common.setting')}`">
          <a-form layout="vertical">
            <a-form-item :label="`${t('common.server')} IP`">
              <a-input v-model:value="server.ip"     placeholder="127.0.0.1" />
            </a-form-item>
            <a-form-item label="API URL">
              <a-input v-model:value="server.apiUrl" placeholder="http://localhost:22021/api" />
            </a-form-item>
            <a-button block @click="onSaveServer">{{ t('common.save') }}</a-button>
          </a-form>
        </a-collapse-panel>
      </a-collapse>

      <p v-if="useMock" class="login__mock">
        목(mock) 모드입니다. 아이디/비밀번호를 아무 값으로 입력해도 로그인됩니다.
      </p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import { useAppStore } from '@/store/appStore';

const { t } = useI18n();
const router = useRouter();
const appStore = useAppStore();

const iconUrl = `${import.meta.env.BASE_URL}icon-192.png`;
const useMock = import.meta.env.VITE_USE_MOCK === 'true';

const submitting = ref(false);
const form = reactive({ loginId: useMock ? 'admin' : '', password: useMock ? 'admin' : '' });
const server = reactive({ ip: '', apiUrl: '' });

const onSaveServer = () => {
  appStore.setConfig({ ip: server.ip, apiUrl: server.apiUrl });
  message.success(t('message.saved'));
};

const onLogin = async () => {
  if (!form.loginId || !form.password) {
    message.warning(t('message.loginRequired'));
    return;
  }

  submitting.value = true;
  const success = await appStore.login({ loginId: form.loginId, password: form.password });
  submitting.value = false;

  if (success) router.push({ name: 'dashboard' }).catch(() => {});
};

onMounted(() => {
  appStore.loadConfig();
  server.ip = appStore.config.ip;
  server.apiUrl = appStore.config.apiUrl;
});
</script>

<style scoped>
.login {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
}

.login__card {
  width: 360px;
  padding: 32px 28px 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.25);
}

.login__brand {
  margin-bottom: 24px;
  text-align: center;
}

.login__logo {
  width: 84px;
  height: 84px;
  border-radius: 18px;
  box-shadow: 0 6px 18px rgba(110, 18, 28, 0.28);
}

.login__title {
  margin: 14px 0 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.3px;
  color: var(--wms-gnb-bg);
}

.login__desc {
  margin: 4px 0 0;
  color: var(--wms-text-sub);
  font-size: 12px;
}

.login__server {
  margin-top: 12px;
}

.login__mock {
  margin: 4px 0 0;
  color: var(--wms-primary);
  font-size: 11px;
  text-align: center;
}
</style>
