<template>
  <div class="login-container">
    <!-- 左侧装饰区域 -->
    <div class="decoration-panel">
      <div class="decoration-content">
        <div class="floating-shapes">
          <div class="shape-1"></div>
          <div class="shape-2"></div>
          <div class="shape-3"></div>
          <div class="shape-4"></div>
        </div>
        <div class="brand-section">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
              <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
              <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
              <path d="M12 21c0-1-1-3-3-3s-3 2-3 3 1 3 3 3 3-2 3-3"/>
            </svg>
          </div>
          <h1 class="brand-title">Equip Sys</h1>
          <p class="brand-subtitle">安全 · 高效 · 可靠</p>
        </div>
        <div class="feature-points">
          <div class="feature-item" v-for="(feature, index) in features" :key="index">
            <div class="feature-icon">
              <component :is="feature.icon"></component>
            </div>
            <span>{{ feature.text }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="form-panel">
      <div class="form-container">
        <div class="form-header">
          <h2>登录账户</h2>
          <p>欢迎回来，请输入您的凭据</p>
        </div>

        <!-- 账号密码登录 -->
        <form @submit.prevent="handleAccountLogin" class="login-form">
          <div class="form-field">
            <label class="field-label">
              用户名/邮箱
            </label>
            <div class="input-group">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                  v-model="accountForm.account"
                  :type="'text'"
                  class="form-input"
                  :placeholder="'请输入用户名/邮箱'"
                  required
              >
            </div>
          </div>

          <div class="form-field">
            <label class="field-label">密码</label>
            <div class="input-group">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                  v-model="accountForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="请输入密码"
                  required
              >
              <button
                  type="button"
                  @click="togglePasswordVisibility"
                  class="password-toggle"
              >
                <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- 记住我选框 -->
          <div class="remember-me">
            <input
                type="checkbox"
                id="rememberAccount"
                v-model="accountForm.remember"
                class="remember-checkbox"
            >
            <label for="rememberAccount">记住我</label>
          </div>

          <button type="submit" class="submit-button" :disabled="loading">
            <svg v-if="loading" class="loading-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <span>{{ loading ? '登录中...' : '立即登录' }}</span>
          </button>
        </form>

        <!-- 错误提示 -->
        <div v-if="error" class="error-alert">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <span>{{ error }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.js'
import AuthAPI from '@/api/AuthAPI.js'

const router = useRouter();
const authStore = useAuthStore()

const accountForm = ref({
  account: '',
  password: '',
  remember: false
});

const loading = ref(false);
const error = ref('');
const showPassword = ref(false);

// 特性列表
const features = computed(() => [
  {
    icon: 'SecurityIcon',
    text: '企业级安全保障'
  },
  {
    icon: 'SpeedIcon',
    text: '毫秒级响应速度'
  },
  {
    icon: 'CloudIcon',
    text: '7x24小时服务'
  }
]);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const handleAccountLogin = async () => {
  try {
    loading.value = true;
    error.value = '';

    // 调用API登录
    const responseBefore = await AuthAPI.loginWithUsername(
        accountForm.value.account,
        accountForm.value.password,
        accountForm.value.remember
    );
    const response = responseBefore.data

    console.log(response.code)
    // 处理API响应
    if (response.code === 'success') {
      // 将API数据转换为本地存储格式
      const userData = {
        userName: response.userName,
        roles: response.roles,
        powers: response.powers,
        token: response.token,
        avatarUrl: response.avatarUrl
      };

      authStore.setUser(userData);
      await router.push('/');
    } else {
      error.value = response.msg || '登录失败';
    }
  } catch (err) {
    error.value = '登录失败，请检查网络连接';
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* 隐藏浏览器自带的密码可见性按钮 */
input[type="password"]::-ms-reveal,
input[type="password"]::-ms-clear {
  display: none;
}

input[type="password"] {
  -webkit-text-security: disc !important;
}

input[type="password"] {
  -webkit-text-security: disc !important;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
  min-height: 100vh;
  display: flex;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 左侧装饰面板 */
.decoration-panel {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.decoration-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
  max-width: 400px;
  padding: 40px;
}

.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-shapes > div {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 8s infinite ease-in-out;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 20%;
  animation-delay: 2s;
}

.shape-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 60%;
  animation-delay: 4s;
}

.shape-4 {
  width: 80px;
  height: 80px;
  top: 30%;
  right: 10%;
  animation-delay: 6s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
    opacity: 0.8;
  }
}

.brand-section {
  margin-bottom: 60px;
}

.brand-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.brand-icon svg {
  width: 40px;
  height: 40px;
  color: white;
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.brand-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  font-weight: 400;
}

.feature-points {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.feature-icon {
  width: 24px;
  height: 24px;
  color: white;
  opacity: 0.9;
}

/* 右侧表单面板 */
.form-panel {
  flex: 1;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
}

.form-container {
  width: 100%;
  max-width: 420px;
}

.form-header {
  text-align: center;
  margin-bottom: 40px;
}

.form-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.form-header p {
  color: #718096;
  font-size: 1rem;
  font-weight: 400;
}

/* 表单样式 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 4px;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  width: 20px;
  height: 20px;
  color: #a0aec0;
  z-index: 1;
}

.form-input {
  width: 100%;
  padding: 16px 48px 16px 48px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  color: #2d3748;
  background: white;
  transition: all 0.3s ease;
}

/* 密码输入框特殊样式 */
.form-input[type="password"],
.form-input.password-input {
  padding-right: 48px;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
  color: #a0aec0;
  font-weight: 400;
}

.password-toggle {
  position: absolute;
  right: 16px;
  width: 20px;
  height: 20px;
  background: none;
  border: none;
  color: #a0aec0;
  cursor: pointer;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #667eea;
}

.password-toggle svg {
  width: 100%;
  height: 100%;
}

.submit-button {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 错误提示 */
.error-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: #fed7d7;
  border: 1px solid #feb2b2;
  border-radius: 12px;
  color: #c53030;
  font-size: 0.9rem;
  font-weight: 500;
  animation: slideIn 0.3s ease-out;
}

.error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .decoration-panel {
    display: none;
  }

  .form-panel {
    flex: 1;
  }
}

@media (max-width: 640px) {
  .form-panel {
    padding: 20px;
  }

  .form-header h2 {
    font-size: 1.75rem;
  }
}

@media (max-width: 480px) {
  .form-container {
    max-width: 100%;
  }
}

.remember-me {
  display: flex;
  align-items: center;
  margin: 10px 0;
}

.remember-checkbox {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  accent-color: #667eea; /* 使用主题色 */
  cursor: pointer;
}

.remember-me label {
  font-size: 0.9rem;
  color: #4a5568;
  cursor: pointer;
}
</style>
