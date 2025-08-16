import Logger from "../utils/logger";
import { DiscoEnum, ElectricityMeter } from "../entity/Meter";
import ABSTRACT_SERVICE from "./abstractService/abstractService";
import { appRoot } from "../app";
import { toSentenceCase } from "../utils/formater";
import EmailService from "./email/email.service";
import ejs from "ejs"
import { User } from "../entity/User";
import { getDiscoTariff } from "./meter-management/meter-management.service";
import { frontendBaseUrl } from "../config/env";

async function chargeDailyUsage() {
   try {
     if (process.env.TEST_MODE !== "true") return;

     const meters = (await ABSTRACT_SERVICE.getAllData(ElectricityMeter)) || [];
     if (!meters.length) return;

     for (const meter of meters) {
       if (meter.meterType !== "PREPAID") continue;

       if (meter.meterBalance < 10) {
         await sendLowBalanceNotice(meter);
         continue;
       }

       const newBalance = meter.meterBalance - 10;
       await ABSTRACT_SERVICE.updateByEntry(ElectricityMeter, { id: meter.id }, { meterBalance: newBalance });
       await sendDailyUsageNotice(meter);
     }
   } catch (error) {
     Logger.error("Error executing daily usage", error);
   }
}

const sendLowBalanceNotice = async (meter: any) => {
   const getUser = await ABSTRACT_SERVICE.getUniqueData(User, { id: meter.userId })
   const userName = toSentenceCase(getUser?.fullName || "There");
   const getTariff = getDiscoTariff(meter.disco || DiscoEnum.IKEDC);
   const emailTemplate = "/templates/token-exhausted.ejs";
   const lastUpdated = new Date(meter.updatedAt);

   const emailTemplateBuilder = await ejs.renderFile(`${appRoot}${emailTemplate}`, {
     userName,
     meterNumber: meter.meterNumber,
     currentBalance: parseFloat((+meter.meterBalance / getTariff).toFixed(2)) || 0.0,
     lastUpdated: formatDateWithTime(lastUpdated),
     rechargeUrl: `${frontendBaseUrl}/landing-page`,
     dashboardUrl: `${frontendBaseUrl}/dashboard`,
   });

   await EmailService.sendMail({
     receiverEmail: getUser?.email,
     subject: "Token Exhausted!",
     text: "Action Required!",
     html: emailTemplateBuilder,
   });
}

const sendDailyUsageNotice = async (meter: any) => {
   const getUser = await ABSTRACT_SERVICE.getUniqueData(User, { id: meter.userId });
   const userName = toSentenceCase(getUser?.fullName || "There");
   const getTariff = getDiscoTariff(meter.disco || DiscoEnum.IKEDC);
   const emailTemplate = "/templates/daily-usage.ejs";
   const lastUpdated = new Date();

   const emailTemplateBuilder = await ejs.renderFile(`${appRoot}${emailTemplate}`, {
     userName,
     reportDate: formatDateWithTime(lastUpdated),
     meterNumber: meter.meterNumber,
     dailyUsage: parseFloat((10 / getTariff).toFixed(2)) || 0.0,
     dailyCost: 10,
     averageHourly: "0.65",
     peakHour: "8:00 PM - 9:00 PM",
     yesterdayUsage: parseFloat((15 / getTariff).toFixed(2)) || 0.0,
     usageComparison: "14% less",
     comparisonColor: "#10b981",
     weeklyAverage: "16.8",
     weeklyComparison: "7% less",
     weeklyComparisonColor: "#10b981",
     currentBalance: parseFloat((+meter.meterBalance / getTariff).toFixed(2)) || 0.0,
     estimatedDays: "3",
     rechargeUrl: `${frontendBaseUrl}/landing-page`,
     dashboardUrl: `${frontendBaseUrl}/dashboard`,
   });

   await EmailService.sendMail({
     receiverEmail: getUser?.email,
     subject: "Daily Usage Report!",
     text: "Hey! Your report is ready",
     html: emailTemplateBuilder,
   });
};

function formatDateWithTime(date: Date): string {
  return date
    .toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", " at");
}

const SchedulerService = { chargeDailyUsage }
export default SchedulerService;