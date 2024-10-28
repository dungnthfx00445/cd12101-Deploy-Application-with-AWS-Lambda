import { parseUserId } from '../auth/utils.js'

export const getUserId = (event) => {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  if (typeof parseUserId === 'function') {
    return parseUserId(jwtToken)
  }

  return parseUserId
}
