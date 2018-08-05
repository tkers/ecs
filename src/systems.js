import { LogComponent, WarnComponent } from './components'
import { hasComponent } from './ecs'

export const LogSystem = ents => ents
  .forEach(x => {
    if (hasComponent(WarnComponent)(x))
      console.warn(x.components.LogComponent.message)
    else
      console.log(x.components.LogComponent.message);
    x.removeComponent(LogComponent)
  })

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
