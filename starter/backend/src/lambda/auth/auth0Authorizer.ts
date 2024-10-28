import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.js'

const logger = createLogger('auth')

const jwksUrl = 'https://dev-706lhcn8jh55dxzy.us.auth0.com/.well-known/jwks.json'

export async function handler(event: any) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (error) {
    logger.error('User not authorized', { error: (error as Error).message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: any) {
  const token = getToken(authHeader)
  const jwt = jsonwebtoken.decode(token, { complete: true })

  if (!jwt || !jwt.header) {
    throw new Error('Invalid JWT token')
  }

  try {
    const response = await Axios.get(jwksUrl)
    const keys = response.data.keys
    const signingKey = keys.find((key: any) => key.kid === jwt.header.kid)

    if (!signingKey) {
      throw new Error('Signing key not found')
    }

    const cert = `-----BEGIN CERTIFICATE-----\n${signingKey.x5c[0]}\n-----END CERTIFICATE-----`

    const verifiedToken = jsonwebtoken.verify(token, cert, { algorithms: ['RS256'] })
    return verifiedToken
  } catch (error) {
    logger.error('Token verification failed', { error: (error as Error).message })
    throw new Error('Token verification failed')
  }
}

function getToken(authHeader: any) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}