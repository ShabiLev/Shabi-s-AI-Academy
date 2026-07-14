import { Icon } from './Icon'
import { Link } from 'react-router-dom'
interface EmptyStateProps { title: string; description: string; importance?: string; action?: { label: string; to: string }; example?: { label: string; to: string }; helpId?: string }
export function EmptyState({ title, description, importance, action, example, helpId }: EmptyStateProps) {
  return <div className="empty-state"><span className="empty-state-icon"><Icon name="signal" /></span><div><h2>{title}</h2><p>{description}</p>{importance && <p className="muted-text">{importance}</p>}{(action || example || helpId) && <div className="inline-actions">{action && <Link className="button button-primary" to={action.to}>{action.label}</Link>}{example && <Link to={example.to}>{example.label}</Link>}{helpId && <Link to={`/help?article=${helpId}`}>Help / עזרה</Link>}</div>}</div></div>
}
