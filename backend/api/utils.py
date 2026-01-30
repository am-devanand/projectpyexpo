"""
Utility functions for City Care.
"""

import math


def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points on Earth.
    Returns distance in meters.
    """
    R = 6371000  # Earth's radius in meters
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_phi / 2) ** 2 + 
         math.cos(phi1) * math.cos(phi2) * 
         math.sin(delta_lambda / 2) ** 2)
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


def parse_coords(coords_string):
    """
    Parse 'lat,lng' string to tuple of floats.
    Returns (lat, lng) tuple or None if invalid.
    """
    try:
        parts = coords_string.split(',')
        if len(parts) == 2:
            return float(parts[0].strip()), float(parts[1].strip())
    except (ValueError, AttributeError):
        pass
    return None


def is_within_radius(coords1, coords2, radius_meters=50):
    """
    Check if two coordinate strings are within a given radius.
    """
    point1 = parse_coords(coords1)
    point2 = parse_coords(coords2)
    
    if not point1 or not point2:
        return False
    
    distance = haversine_distance(point1[0], point1[1], point2[0], point2[1])
    return distance <= radius_meters
