import fetch from '@/util/request'

// ==== 登录 ====

export function fetchUserInfo(params) {
  return fetch({
    url: '/api/user/info',
    method: 'GET',
    params,
  })
}

export function fetchLinuxDoLoginUrl(params) {
  return fetch({
    url: '/api/login/linuxdoAuthUrl',
    method: 'GET',
    params,
  })
}

export function doLinuxDoLogin(params) {
  return fetch({
    url: '/api/login/linuxdo',
    method: 'GET',
    params,
  })
}

export function doLogout(params) {
  return fetch({
    url: '/api/login/logout',
    method: 'GET',
    params,
  })
}

// ==== 账号 ====

export function doRegisterDnfAccount(data) {
  return fetch({
    url: '/api/user/registerDnfAccount',
    method: 'POST',
    data,
  })
}

export function doChangeDnfPassword(data) {
  return fetch({
    url: '/api/user/changeDnfPassword',
    method: 'POST',
    data,
  })
}

// ==== 签到 ====

export function fetchSignInInfo(params) {
  return fetch({
    url: '/api/signIn/info',
    method: 'GET',
    params,
  })
}

export function doSignIn(data) {
  return fetch({
    url: '/api/signIn/signIn',
    method: 'POST',
    data,
  })
}
