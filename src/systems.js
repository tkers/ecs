import { hasComponent } from './ecs'
import { SelectableComponent } from './components'

export const RenderSystem = (canvas, w, h) => {
  const ctx = canvas.getContext('2d')
  canvas.width = w
  canvas.height = h

  return ents => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ents
      .forEach(ent => {
        ctx.fillStyle = ent.components.SpriteComponent.color
        ctx.beginPath()
        ctx.arc(ent.components.PositionComponent.x, ent.components.PositionComponent.y, ent.components.SpriteComponent.size, 0, Math.PI * 2)
        ctx.fill()
      })

    ents
      .filter(ent => hasComponent(SelectableComponent)(ent) && ent.components.SelectableComponent.isSelected)
      .forEach(ent => {
        ctx.strokeStyle = '#000000'
        ctx.beginPath()
        ctx.arc(ent.components.PositionComponent.x, ent.components.PositionComponent.y, ent.components.SpriteComponent.size + 5, 0, Math.PI * 2)
        ctx.setLineDash([10, 5])
        ctx.stroke()
        ctx.setLineDash([])
      })
  }
}

export const MovementSystem = (ents, dt) => ents
  .forEach(ent => {
    const r = ent.components.VelocityComponent.direction * Math.PI / 180;
    ent.components.PositionComponent.x += Math.cos(r) * ent.components.VelocityComponent.speed * dt
    ent.components.PositionComponent.y += Math.sin(r) * ent.components.VelocityComponent.speed * dt
  })

const getDist = (x1, y1, x2, y2) => Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
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
      const clickedEnt = ents.find(ent => getDist(
        clickX,
        clickY,
        ent.components.PositionComponent.x,
        ent.components.PositionComponent.y
      ) <= ent.components.SpriteComponent.size)

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

export const WanderSystem = (ents, dt) => ents
  .filter(ent => !hasComponent(SelectableComponent)(ent) || !ent.components.SelectableComponent.isSelected)
  .forEach(ent => {
    ent.components.WanderComponent.timer -= dt
    if (ent.components.WanderComponent.timer > 0)
      return

    ent.components.WanderComponent.timer =
      ent.components.WanderComponent.interval -
      ent.components.WanderComponent.variance +
      Math.random() * 2 * ent.components.WanderComponent.variance

    ent.components.VelocityComponent.direction = Math.random() * 360
  })

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

  return (ents, dt) => ents.filter(ent => ent.components.SelectableComponent.isSelected).forEach(ent => {
    const targetDir = getTargetDir(
      ent.components.PositionComponent.x,
      ent.components.PositionComponent.y,
      mouseX,
      mouseY
    )
    ent.components.VelocityComponent.direction = turnToDir(ent.components.VelocityComponent.direction, targetDir, 360 * dt)
  })
};
