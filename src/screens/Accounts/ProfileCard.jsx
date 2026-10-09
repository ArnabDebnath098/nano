import FreeDeliveryRow from './FreeDeliveryRow.jsx'
import './ProfileCard.css'

// Figma: A · stack (2:8171) — profile row + compact "Get Free Delivery" row
export default function ProfileCard({ name = 'Anmol Jain', email = 'ajain@gmail.com', onEdit, onFreeDelivery }) {
  return (
    <section className="profile-card" aria-label="Your profile">
      {/* Profile (2:8172) */}
      <div className="profile-card__profile">
        <span className="profile-card__avatar" aria-hidden="true">
          {name.charAt(0)}
        </span>
        <div className="profile-card__info">
          <p className="profile-card__name">{name}</p>
          <p className="profile-card__email">{email}</p>
        </div>
        {/* Edit (2:8178) */}
        <button type="button" className="profile-card__edit" aria-label="Edit profile" onClick={onEdit}>
          <span className="profile-card__edit-icon">
            <img src="/figma/accounts/edit-pen.svg" width="12.375" height="11.6954" alt="" />
          </span>
        </button>
      </div>

      <FreeDeliveryRow compact onClick={onFreeDelivery} />
    </section>
  )
}
