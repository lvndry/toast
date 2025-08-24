from src.user import UserTier

# Monthly limits per tier
TIER_LIMITS = {
    UserTier.FREE: 100,  # 100 company searches per month
    UserTier.BUSINESS: 1000,  # 1000 company searches per month
    UserTier.ENTERPRISE: 10000,  # 10000 company searches per month
}

# Tier display names
TIER_DISPLAY_NAMES = {
    UserTier.FREE: "Free",
    UserTier.BUSINESS: "Pro",
    UserTier.ENTERPRISE: "Enterprise",
}

# Tier descriptions
TIER_DESCRIPTIONS = {
    UserTier.FREE: "Perfect for individual researchers and small teams.",
    UserTier.BUSINESS: "For growing legal teams and professionals.",
    UserTier.ENTERPRISE: "For large legal teams and organizations.",
}
