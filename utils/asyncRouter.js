// ─────────────────────────────────────────────────────────────────────────────
// utils/asyncRouter.js — express.Router() whose handlers may be async.
// Express 4 ignores rejected promises; this forwards them to the error handler
// in server.js instead of leaving the request hanging.
// ─────────────────────────────────────────────────────────────────────────────
import { Router } from 'express'

const wrap = (fn) => (req, res, next) => {
  try {
    const out = fn(req, res, next)
    if (out && typeof out.catch === 'function') out.catch(next)
  } catch (err) {
    next(err)
  }
}

export function asyncRouter() {
  const router = Router()
  for (const method of ['get', 'post', 'put', 'patch', 'delete', 'use']) {
    const original = router[method].bind(router)
    router[method] = (...args) =>
      original(...args.map(h => (typeof h === 'function' && h.length < 4 ? wrap(h) : h)))
  }
  return router
}
