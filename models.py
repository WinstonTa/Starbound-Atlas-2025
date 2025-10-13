from pydantic import BaseModel, Field
from typing import List, Optional

class Deal(BaseModel):
    """Deal item extracted from menu"""
    name: str = Field(..., description = "Name of item")
    price: str = Field(..., description = "Price of happy hour")
    description: Optional[str] = Field(None, description = "Details about the deal")

class TimeWindow(BaseModel):
    """Deal availability"""
    start_time : str = Field(..., description = "Start time (e.g., '11:00 AM') ")
    end_time: str = Field(..., description = "End time (e.g., '4:00 PM') ")
    days: Optional[List[str]] = Field(None, description = "Days when deal is active")

class MenuParsing(BaseModel):
    restaurant_name: Optional[str] = Field(None, description = "Restaurant/bar name")
    deals: List[Deal] = Field(..., description = "List of deals that are extracted")
    time_frame: List[TimeWindow] = Field(default_factory = list, description = "When the deal is available")
    special_conditions: Optional[List[str]] = Field(None, description = "Additional restrictions or requirements as bullet points")
