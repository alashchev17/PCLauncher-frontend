export interface SendRequest {
  launcher: number
  type: number
  token: string
  data: any
}
//Интерфейсы для входящих запросов

export interface IncomingRequest {
  type: number
  response: {
    error: number
    error_message: string
  } | null
}

export interface AuthorizationRequest {
  user_id: number
  user_login: string
  characters: any[]
  session_token: string
  two_factor: number
  token: string
  launcher_update: boolean
}

export interface NotificationRequest {
  character_name: string
  date: number
  status: number
  text: string
  account_id: number
}

export interface WidgetRequest {
  type: number
  url: string
  header: string
  description: string
  display: number
  image: string
}
