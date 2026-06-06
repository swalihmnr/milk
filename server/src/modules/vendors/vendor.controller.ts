import { Request, Response } from 'express';
import Vendor from '../../models/Vendor';
import User from '../../models/User';

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export const getApprovedVendors = async (req: Request, res: Response) => {
  try {
    const vendors = await Vendor.find({ approvalStatus: 'approved' }).populate('userId', 'name phone email farmName addressLine village city state lat lon');
    
    const { lat, lon } = req.query;
    
    let result = vendors.map((v: any) => {
      const vendorObj = v.toObject ? v.toObject() : v;
      let distance = null;
      
      if (lat && lon && vendorObj.userId?.lat && vendorObj.userId?.lon) {
        distance = getDistance(
          Number(lat), 
          Number(lon), 
          Number(vendorObj.userId.lat), 
          Number(vendorObj.userId.lon)
        );
      }
      
      return {
        ...vendorObj,
        distance: distance !== null ? Number(distance.toFixed(2)) : null
      };
    });

    if (lat && lon) {
      result.sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return a.distance - b.distance;
      });
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
