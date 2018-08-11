import { hasComponent } from './ecs'
import { SelectableComponent, SpriteComponent } from './components'

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
    const r = ent.components.VelocityComponent.direction * Math.PI / 180;
    ent.components.PositionComponent.x += Math.cos(r) * ent.components.VelocityComponent.speed
    ent.components.PositionComponent.y += Math.sin(r) * ent.components.VelocityComponent.speed
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

const wrapDir = d => (d + 360) % 360

const turnToDir = (startDir, targetDir, maxSpeed = 180) => {
  const targetDirDiff = startDir - targetDir
  const turnDir = wrapDir(targetDirDiff) > 180 ? 1 : -1
  const turnSpeed = Math.min(Math.abs(targetDirDiff), maxSpeed)
  return wrapDir(startDir + turnDir * turnSpeed)
}

const getTargetDir = (startX, startY, targetX, targetY) => {
  const dx = targetX - startX
  const dy = targetY - startY
  return Math.atan2(dy, dx) * 180 / Math.PI
}

export const MouseTargetSystem = (canvas) => {
  let mouseX = 0
  let mouseY = 0
  canvas.addEventListener('mousemove', (e) => {
    mouseX = e.pageX - e.target.offsetLeft
    mouseY = e.pageY - e.target.offsetTop
  })

  return ents => ents.filter(ent => ent.components.SelectableComponent.isSelected).forEach(ent => {
    const offset = hasComponent(SpriteComponent)(ent) ? ent.components.SpriteComponent.size / 2 : 0
    const targetDir = getTargetDir(
      ent.components.PositionComponent.x,
      ent.components.PositionComponent.y,
      mouseX - offset,
      mouseY - offset
    )
    ent.components.VelocityComponent.direction = turnToDir(ent.components.VelocityComponent.direction, targetDir, 6)
  })
};
