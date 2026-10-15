"""
Dashboard API:  GET /api/v1/dashboard/stats
Returns aggregated diagnosis statistics per governorate for the
CRDA surveillance choropleth map. No personal data exposed.
"""
from __future__ import annotations

from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import func, select, distinct
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_session
from app.models.db_models import DiagnosisEvent, User

router = APIRouter()


class GovernorateStats(BaseModel):
    governorate: str
    total_events: int
    avg_severity: float
    avg_risk_score: float
    dominant_disease: str
    epidemiological_intensity: float  # 0–1 normalised


class DashboardResponse(BaseModel):
    period_start: date
    period_end: date
    governorate_stats: list[GovernorateStats]
    national_total: int
    active_alerts: int       # events with severity >= 3
    regions_monitored: int   # distinct governorates with events
    registered_farmers: int  # total users with role=farmer


@router.get("/dashboard/stats", response_model=DashboardResponse)
async def dashboard_stats(
    days: int = Query(default=30, ge=1, le=365, description="Look-back window in days"),
    disease: str | None = Query(default=None, description="Filter by disease class"),
    session: AsyncSession = Depends(get_session),
) -> DashboardResponse:
    end_dt = date.today()
    start_dt = end_dt - timedelta(days=days)

    # Base query for events in the period
    q = select(DiagnosisEvent).where(
        DiagnosisEvent.timestamp >= start_dt,
        DiagnosisEvent.timestamp <= end_dt,
    )
    if disease:
        q = q.where(DiagnosisEvent.disease_class == disease)

    events = (await session.execute(q)).scalars().all()

    # KPIs
    active_alerts = sum(1 for e in events if e.severity_level >= 3)
    regions_monitored = len({e.governorate for e in events if e.governorate})

    # Count registered farmers
    farmer_count_result = await session.execute(
        select(func.count(User.id)).where(User.role == "farmer")
    )
    registered_farmers = farmer_count_result.scalar() or 0

    # Aggregate per governorate
    gov_map: dict[str, list[DiagnosisEvent]] = {}
    for ev in events:
        gov_map.setdefault(ev.governorate, []).append(ev)

    max_count = max((len(v) for v in gov_map.values()), default=1)

    stats: list[GovernorateStats] = []
    for gov, evs in gov_map.items():
        disease_counts: dict[str, int] = {}
        for ev in evs:
            disease_counts[ev.disease_class] = disease_counts.get(ev.disease_class, 0) + 1
        dominant = max(disease_counts, key=disease_counts.get)  # type: ignore[arg-type]

        avg_severity = sum(e.severity_level for e in evs) / len(evs)
        avg_risk = sum((e.risk_score or 0.0) for e in evs) / len(evs)
        intensity = len(evs) / max_count

        stats.append(GovernorateStats(
            governorate=gov,
            total_events=len(evs),
            avg_severity=round(avg_severity, 2),
            avg_risk_score=round(avg_risk, 4),
            dominant_disease=dominant,
            epidemiological_intensity=round(intensity, 4),
        ))

    stats.sort(key=lambda s: s.epidemiological_intensity, reverse=True)

    return DashboardResponse(
        period_start=start_dt,
        period_end=end_dt,
        governorate_stats=stats,
        national_total=len(events),
        active_alerts=active_alerts,
        regions_monitored=regions_monitored,
        registered_farmers=registered_farmers,
    )
