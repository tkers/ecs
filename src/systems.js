import { hasComponent } from './ecs'
import { TargetComponent, SelectableComponent } from './components'

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
        if (hasComponent(SelectableComponent)(ent) && ent.components.SelectableComponent.isSelected) {
          ctx.fillStyle = '#000000'
          ctx.strokeRect(ent.components.PositionComponent.x - 5, ent.components.PositionComponent.y - 5, ent.components.SpriteComponent.size + 10, ent.components.SpriteComponent.size + 10)
        }
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

export const MouseSelectionSystem = (canvas) => {
  let clickX = 0
  let clickY = 0
  let mode = 0
  canvas.addEventListener('mousedown', (e) => {
    clickX = e.pageX - e.target.offsetLeft
    clickY = e.pageY - e.target.offsetTop
    mode = 1
  })

  canvas.addEventListener('mouseup', (e) => {
    clickX = e.pageX - e.target.offsetLeft
    clickY = e.pageY - e.target.offsetTop
    mode = 2
  })

  return ents => {
    if (!mode)
      return

    if (mode === 1) {
      const clickedEnt = ents.find(ent => (
        clickX >= ent.components.PositionComponent.x &&
        clickY >= ent.components.PositionComponent.y &&
        clickX <= ent.components.PositionComponent.x + ent.components.SpriteComponent.size &&
        clickY <= ent.components.PositionComponent.y + ent.components.SpriteComponent.size
      ))

      if (clickedEnt)
        clickedEnt.components.SelectableComponent.isSelected = true
    }

    if (mode === 2) {
      ents.forEach(ent => {
        ent.components.SelectableComponent.isSelected = false
      })
    }

    mode = 0
  }
}

export const MouseTargetSystem = (canvas) => {
  let mouseX = 0
  let mouseY = 0
  let triggered = false
  canvas.addEventListener('mousemove', (e) => {
    mouseX = e.pageX - e.target.offsetLeft
    mouseY = e.pageY - e.target.offsetTop
    triggered = true
  })

  return ents => {
    if (!triggered)
      return
    triggered = false

    ents.filter(ent => ent.components.SelectableComponent.isSelected).forEach(ent => {
      const offset = hasComponent(SpriteComponent)(ent) ? ent.components.SpriteComponent.size / 2 : 0
      ent.components.TargetComponent.x = mouseX - offset
      ent.components.TargetComponent.y = mouseY - offset
    })
  }
};
