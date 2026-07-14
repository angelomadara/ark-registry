import { Router } from 'express'
import authRouter from './auth.routes'
import speciesRouter from './species.routes'

const router = Router()

router.use('/v1/auth', authRouter)
router.use('/v1/species', speciesRouter)

export default router
