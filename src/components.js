export function SpriteComponent(size, color) {
  this.size = size
  this.color = color
}

export function PositionComponent(x, y) {
  this.x = x
  this.y = y
}

export function VelocityComponent(vx, vy) {
  this.vx = vx
  this.vy = vy
}

export function TargetComponent(tx, ty, velocity) {
  this.x = tx
  this.y = ty
  this.v = velocity
}

export function SelectableComponent(isSelected) {
  this.isSelected = isSelected
}
