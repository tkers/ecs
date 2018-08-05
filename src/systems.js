import { TargetComponent} from './components'

export const RenderSystem = (canvas, w, h) => {
  const ctx = canvas.getContext('2d')
  canvas.width = w
  canvas.height = h

  return ents => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ents
      .forEach(ent => {
        ctx.fillStyle = ent.components.SpriteComponent.color
        ctx.fillRect(ent.components.PositionComponent.x, ent.components.PositionComponent.y, ent.components.SpriteComponent.size, ent.components.SpriteComponent.size)
      })
    }
}

export const MovementSystem = ents => ents
  .forEach(ent => {
    ent.components.PositionComponent.x += ent.components.VelocityComponent.vx
    ent.components.PositionComponent.y += ent.components.VelocityComponent.vy
  })

export const TargetingSystem = ents => ents
  .forEach(ent => {
    const xi = ent.components.PositionComponent.x
    const yi = ent.components.PositionComponent.y
    const xt = ent.components.TargetComponent.x
    const yt = ent.components.TargetComponent.y
    const dx = xt - xi
    const dy = yt - yi
    const angle = Math.atan2(dy, dx)
    ent.components.VelocityComponent.vx = Math.cos(angle) * ent.components.TargetComponent.v
    ent.components.VelocityComponent.vy = Math.sin(angle) * ent.components.TargetComponent.v
    if (Math.sqrt(dx ** 2 + dy ** 2) < ent.components.TargetComponent.v) {
      ent.components.VelocityComponent.vx = 0
      ent.components.VelocityComponent.vy = 0
      ent.removeComponent(TargetComponent)
    }
  })
