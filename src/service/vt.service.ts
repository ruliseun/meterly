import { DiscoServiceCodeEnum } from "../enums/disco.enum";
import { DiscoEnum } from "../entity/Meter";
import { createError } from "./abstractService/abstractService";
import { ResponseCodeEnum } from "../enums/response-codes.enum";
import { makeNetworkCall } from "./networks.service";
import { VT_API_KEY, VT_SECRET_KEY } from "../config/env";

export function generateRequestId(suffix = "meterly") {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const yyyy = map.year;
  const mm = map.month;
  const dd = map.day;
  const hh = map.hour;
  const ii = map.minute;

  const prefix = `${yyyy}${mm}${dd}${hh}${ii}`;

  return prefix + String(suffix);
}

function getServiceId(disco: string) {
   let serviceId = ""

   switch (disco) {
      case DiscoEnum.AEDC:
         serviceId = DiscoServiceCodeEnum.AEDC
         break;
      case DiscoEnum.BEDC:
         serviceId = DiscoServiceCodeEnum.BEDC
         break;
      case DiscoEnum.EKEDC:
         serviceId = DiscoServiceCodeEnum.EKEDC
         break;
      case DiscoEnum.IBEDC:
         serviceId = DiscoServiceCodeEnum.IBEDC
         break;
      case DiscoEnum.IKEDC:
         serviceId = DiscoServiceCodeEnum.IKEDC
         break;
      case DiscoEnum.JEDC:
         serviceId = DiscoServiceCodeEnum.JEDC
         break;
      case DiscoEnum.KEDC:
         serviceId = DiscoServiceCodeEnum.KEDC
         break;
      case DiscoEnum.PHEDC:
         serviceId = DiscoServiceCodeEnum.PHEDC
         break;
      case DiscoEnum.EEDC:
         serviceId = DiscoServiceCodeEnum.EEDC
         break;
      default:
         throw createError("Invalid disco", ResponseCodeEnum.BAD_REQUEST)
   }

   return serviceId;
}

export async function verifyMeterNumber(data: { meterNumber: string; meterType: "prepaid" | "postpaid"; disco: string }) {
   const buildPayload = {
     billersCode: data.meterNumber,
     serviceID: getServiceId(data.disco),
     type: data.meterType,
   };

   const verifyMeterData = await makeNetworkCall({
     url: "https://sandbox.vtpass.com/api/merchant-verify",
     method: "POST",
     payload: buildPayload,
     headers: {
       "Content-Type": "application/json",
       "api-key": VT_API_KEY,
       "secret-key": VT_SECRET_KEY,
     },
   });

   if (verifyMeterData?.data?.content?.error) {
      throw createError(
        verifyMeterData?.data?.content?.error || "Error Verifying Meter Number",
        ResponseCodeEnum.BAD_REQUEST,
      );
   }

   return verifyMeterData.data.content;
}

const VTService = {
  verifyMeterNumber,
};

export default VTService;