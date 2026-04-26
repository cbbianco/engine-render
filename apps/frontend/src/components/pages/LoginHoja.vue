<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth/index'
import { useNotificationStore } from '@/stores/notifications'
import { getErrorColor, getThemeCssVars } from '@/model/auth/css/auth.css.dto'
import { 
  AppTitle, 
  AppText, 
  AppLabel, 
  AppButton, 
  AppInput, 
  AppFieldError, 
  AppModalError, 
  IconLogoFallback,
  PasswordInputNative
} from '@/components/atoms'
import { validateLogin } from '@/utils/hojas/LoginHojaUtils'
import { AuthService } from '@/services/auth'
import { RoutingService } from '@/router/routing'
import { getCustomerDomain } from '@/utils/customer/domain'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const { themeCss: storeThemeCss, customerLogo } = storeToRefs(authStore)

const dynamicStyles = computed(() => getThemeCssVars(storeThemeCss.value))

const router = useRouter()
const authService = new AuthService()
const domain = ref(getCustomerDomain())
const userName = ref(authStore.userName || '')
const password = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const domainError = ref('')
const userNameError = ref('')
const passwordError = ref('')
const logoError = ref(false)
const modalError = ref<{ title: string; message: string } | null>(null)

const errorColor = computed(() => getErrorColor(storeThemeCss.value))

onMounted(() => {
  authStore.clearState()
})

/** Textos de la pantalla de login; los no enviados por el backend se cargan por defecto en inglés. */
const loginTexts = computed(() => authStore.loginTexts)

// DIAGNÓSTICO DE REACTIVIDAD
watch(userName, (newVal) => {
  console.log('[Login-Debug] Usuario cambió:', newVal)
})
watch(password, (newVal) => {
  console.log('[Login-Debug] Password cambió. Longitud actual:', newVal.length)
})

const handleLogin = async () => {
  errorMsg.value = ''
  domainError.value = ''
  userNameError.value = ''
  passwordError.value = ''
  modalError.value = null

  const resultVal = validateLogin(domain.value, userName.value, password.value, loginTexts.value)
  if (!resultVal.valid) {
    domainError.value = resultVal.domainError
    userNameError.value = resultVal.userNameError
    passwordError.value = resultVal.passwordError
    return
  }

  isLoading.value = true
  
  console.log('[LoginHoja] Attempting login', {
    userName: userName.value.trim(),
    passwordLength: password.value.length,
    domain: domain.value
  })

  // 1. Llamada al servicio de autenticación
  const result = await authService.login(
    { domainOrUsername: userName.value.trim(), password: password.value, initialToken: authStore.initialToken },
    loginTexts.value.modal
  )

  if (result.success) {
    // 2. Hidratar el Store
    authStore.authenticated(result.payload, userName.value)

    // 3. Configurar Rutas Dinámicas
    RoutingService.configureRoutes(router, result.payload.finalPaths)

    // 4. Navegar a la ruta post-login
    const nextPath = authStore.getPostLoginRedirectPath()
    notificationStore.addNotification('success', 'Sesión Iniciada', `Bienvenido de nuevo, ${userName.value}`)
    await router.push(nextPath ?? '/')
  } else {
    modalError.value = { 
      title: result.title || 'Error', 
      message: result.message || 'Error desconocido' 
    }
    notificationStore.addNotification('error', 'Error de Acceso', result.message || 'Credenciales inválidas')
  }

  isLoading.value = false
}
</script>

<template>
  <div class="login-container" :style="dynamicStyles">
    <div class="card">
      <div class="logo-wrap">
        <img
          v-if="customerLogo && !logoError"
          :src="customerLogo"
          alt="Logo"
          class="logo-img"
          @error="logoError = true"
        />
        <IconLogoFallback v-else />
      </div>
      <AppTitle>{{ loginTexts.title }}</AppTitle>
      <AppText variant="secondary">{{ loginTexts.subtitle }}</AppText>

      <form @submit.prevent="handleLogin" novalidate>
        <div class="input-group">
          <AppLabel for="login-username">Usuario</AppLabel>
          <AppInput
            id="login-username"
            type="text"
            autocomplete="username"
            v-model="userName"
            placeholder="Usuario"
            required
            :invalid="!!userNameError"
            :error-color="errorColor"
          />
          <AppFieldError v-if="userNameError" id="login-username-error" :error-color="errorColor">{{ userNameError }}</AppFieldError>
        </div>
        <div class="input-group">
          <PasswordInputNative
            id="login-password"
            v-model="password"
            :label="loginTexts.passwordLabel"
            :placeholder="loginTexts.passwordPlaceholder"
            required
            :invalid="!!passwordError"
            :error-message="passwordError"
            :error-color="errorColor"
          />
        </div>

        <AppText v-if="errorMsg" variant="error" tag="div" class="error-msg">
          {{ errorMsg }}
        </AppText>

        <AppButton type="submit" :disabled="isLoading">
          {{ isLoading ? loginTexts.loadingButton : loginTexts.submitButton }}
        </AppButton>
      </form>
    </div>

    <AppModalError
      v-if="modalError"
      :visible="!!modalError"
      :title="modalError.title"
      :message="modalError.message"
      :error-color="errorColor"
      @close="modalError = null"
    />
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: var(--bg-page);
}

.card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.logo-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  min-height: 4rem;
}

.logo-img {
  max-height: 4rem;
  max-width: 180px;
  object-fit: contain;
}

.input-group {
  margin-bottom: 1rem;
}

.error-msg {
  margin-bottom: 1rem;
}
</style>
