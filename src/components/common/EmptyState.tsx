import { Icon } from './Icon'
export function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="empty-state"><span className="empty-state-icon"><Icon name="signal" /></span><div><h2>{title}</h2><p>{description}</p></div></div>
}
