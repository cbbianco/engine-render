<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth/index'
import { getErrorColor, getThemeCssVars } from '@/model/auth/css/auth.css.dto'
import { 
  AppTitle, 
  AppText, 
  AppLabel, 
  AppButton, 
  AppInput, 
  AppFieldError, 
  AppModalError,
  PasswordInputNative
} from '@/components/atoms'
import { AuthService } from '@/services/auth'
import { RoutingService } from '@/router/routing'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const { themeCss: storeThemeCss, userName: storeUsername } = storeToRefs(authStore)
const router = useRouter()
const authService = new AuthService()

const dynamicStyles = computed(() => getThemeCssVars(storeThemeCss.value))
const errorColor = computed(() => getErrorColor(storeThemeCss.value))
const loginTexts = computed(() => authStore.loginTexts)

const domain = ref(storeUsername.value || '')
const password = ref('')
const isLoading = ref(false)
const domainError = ref('')
const passwordError = ref('')
const modalError = ref<{ title: string; message: string } | null>(null)

function validate(): boolean {
  let valid = true
  domainError.value = ''
  passwordError.value = ''
  
  const domainTrimmed = domain.value.trim()
  const t = loginTexts.value

  if (!domainTrimmed) {
    domainError.value = t.errors.domainRequired
    valid = false
  }

  if (!password.value) {
    passwordError.value = t.errors.passwordRequired
    valid = false
  }

  return valid
}

const handleLogin = async () => {
  domainError.value = ''
  passwordError.value = ''
  modalError.value = null

  if (!validate()) return

  isLoading.value = true
  
  const result = await authService.login(
    { domainOrUsername: domain.value.trim(), password: password.value, initialToken: authStore.initialToken },
    loginTexts.value.modal
  )

  if (result.success) {
    // 1. Hidratar el Store con los nuevos datos (incluyendo token refrescado)
    authStore.authenticated(result.payload, domain.value)

    // 2. Actualizar Rutas (por si cambiaron durante la sesión)
    RoutingService.configureRoutes(router, result.payload.finalPaths)

    // 3. Cerrar el modal de re-autenticación
    authStore.isReauthenticating = false
  } else {
    modalError.value = { 
      title: result.title || 'Error', 
      message: result.message || 'Error de re-autenticación' 
    }
  }
  isLoading.value = false
}
</script>

<template>
  <Teleport to="body">
    <div class="reauth-backdrop" :style="dynamicStyles">
      <div class="reauth-modal">
        <div class="reauth-modal__header">
          <AppTitle>{{ loginTexts.title }}</AppTitle>
          <AppText variant="secondary">Por favor re-identifícate para actualizar tu sesión</AppText>
        </div>

        <div v-if="modalError" class="reauth-modal__error-inline" :style="{ borderColor: errorColor }">
          <p class="error-title" :style="{ color: errorColor }">{{ modalError.title }}</p>
          <p class="error-message">{{ modalError.message }}</p>
        </div>

        <form @submit.prevent="handleLogin" class="reauth-modal__form">
          <div class="reauth-modal__group">
            <AppLabel for="reauth-domain">{{ loginTexts.domainLabel }}</AppLabel>
            <AppInput
              id="reauth-domain"
              type="text"
              :model-value="domain"
              :placeholder="loginTexts.domainPlaceholder"
              :invalid="!!domainError"
              :error-color="errorColor"
              @update:model-value="domain = ($event || '').replace(/\s/g, '')"
            />
            <AppFieldError v-if="domainError" :error-color="errorColor">{{ domainError }}</AppFieldError>
          </div>

          <div class="reauth-modal__group">
            <PasswordInputNative
              id="reauth-password"
              :model-value="password"
              :label="loginTexts.passwordLabel"
              :placeholder="loginTexts.passwordPlaceholder"
              :invalid="!!passwordError"
              :error-message="passwordError"
              :error-color="errorColor"
              @update:model-value="password = ($event || '').replace(/\s/g, '')"
            />
          </div>

          <div class="reauth-modal__actions">
            <AppButton type="submit" :disabled="isLoading">
              {{ isLoading ? loginTexts.loadingButton : loginTexts.submitButton }}
            </AppButton>
            <button 
              type="button" 
              class="reauth-modal__cancel" 
              @click="authService.logout()"
            >
              Volver al Login
            </button>
          </div>
        </form>

        <AppModalError
          v-if="modalError"
          :visible="!!modalError"
          :title="modalError.title"
          :message="modalError.message"
          :error-color="errorColor"
          @close="modalError = null"
        />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.reauth-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1.5rem;
  animation: fade-in 0.3s ease-out;
}

.reauth-modal {
  background: #ffffff;
  border-radius: 1.25rem;
  padding: 2.5rem;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: scale-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.reauth-modal__header {
  text-align: center;
  margin-bottom: 2rem;
}

.reauth-modal__group {
  margin-bottom: 1.5rem;
}

.reauth-modal__error-inline {
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-left-width: 4px;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  animation: slide-down 0.3s ease-out;
}

.reauth-modal__error-inline .error-title {
  font-weight: 700;
  font-size: 0.875rem;
  margin-bottom: 0.125rem;
}

.reauth-modal__error-inline .error-message {
  color: #991b1b;
  font-size: 0.8125rem;
  line-height: 1.25;
}

@keyframes slide-down {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.reauth-modal__actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.reauth-modal__cancel {
  background: transparent;
  color: #64748b;
  font-weight: 600;
  font-size: 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  padding: 0.75rem;
  transition: all 0.2s;
}

.reauth-modal__cancel:hover {
  background: #f8fafc;
  color: #1e293b;
  border-color: #cbd5e1;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scale-up {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
