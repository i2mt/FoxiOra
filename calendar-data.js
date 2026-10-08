/* Official Iranian calendar, 1405, University of Tehran Calendar Center.
   Source: https://calendar.ut.ac.ir/documents/2139738/7092644/Calendar-1405.pdf
   Text mirror: https://www.scribd.com/document/990789768/Calendar-1405
   Lunar dates apply ONLY to 1405; fixed solar holidays recur.
   Occasion entries below are selected national, cultural, religious and health dates, not an exhaustive calendar. */
const SOLAR_HOLIDAYS={
 '1/1':['Nowruz','نوروز'],'1/2':['Nowruz','نوروز'],'1/3':['Nowruz','نوروز'],'1/4':['Nowruz','نوروز'],
 '1/12':['Islamic Republic Day','روز جمهوری اسلامی'],'1/13':['Nature Day','روز طبیعت'],
 '3/14':['Khomeini memorial','رحلت امام خمینی'],'3/15':['15 Khordad','قیام ۱۵ خرداد'],
 '11/22':['Revolution Day','پیروزی انقلاب اسلامی'],'12/29':['Oil Nationalization Day','ملی شدن صنعت نفت']
};
const LUNAR_HOLIDAYS={1405:{
 '1/1':['Eid al-Fitr','عید فطر'],'1/2':['Eid al-Fitr holiday','روز دوم عید فطر'],
 '1/25':['Imam Sadegh memorial','شهادت امام جعفر صادق'],
 '3/6':['Eid al-Adha','عید قربان'],'3/14':['Eid al-Ghadir','عید غدیر'],
 '4/3':['Tasua','تاسوعا'],'4/4':['Ashura','عاشورا'],'5/13':['Arbaeen','اربعین'],
 '5/21':['Prophet and Imam Hasan memorial','رحلت پیامبر و شهادت امام حسن'],
 '5/22':['Imam Reza memorial','شهادت امام رضا'],'5/30':['Imam Hasan Askari memorial','شهادت امام حسن عسکری'],
 '6/8':['Prophet and Imam Sadegh birthday','میلاد پیامبر و امام جعفر صادق'],
 '8/22':['Fatimah memorial','شهادت حضرت فاطمه'],'10/2':['Imam Ali birthday','ولادت امام علی'],
 '10/16':['Mabath','مبعث پیامبر'],'11/4':['Mid-Shaban','نیمهٔ شعبان'],
 '12/9':['Imam Ali memorial','شهادت امام علی'],'12/19':['Eid al-Fitr','عید فطر'],'12/20':['Eid al-Fitr holiday','روز دوم عید فطر']
}};
function isWeekend(d){return (S.weekend||[5]).includes(d.getDay())}
function holidayInfo(d){if(S.holidays===false)return [];const j=jp(d),key=j.m+'/'+j.d;return [SOLAR_HOLIDAYS[key],LUNAR_HOLIDAYS[j.y]?.[key]].filter(Boolean).map(x=>S.lang==='fa'?x[1]:x[0])}

const SOLAR_OCCASIONS={
 "1/6": [
  "Zoroaster birthday",
  "زادروز زرتشت"
 ],
 "1/20": [
  "Nuclear Technology Day",
  "روز فناوری هسته‌ای"
 ],
 "1/25": [
  "Attar Day",
  "بزرگداشت عطار"
 ],
 "1/29": [
  "Army Day",
  "روز ارتش"
 ],
 "1/30": [
  "Laboratory Professionals Day",
  "روز آزمایشگاهیان"
 ],
 "2/1": [
  "Saadi Day",
  "بزرگداشت سعدی"
 ],
 "2/3": [
  "Architecture Day",
  "روز معماری"
 ],
 "2/9": [
  "Counsellor & Psychologist Day",
  "روز روانشناس و مشاور"
 ],
 "2/10": [
  "Persian Gulf Day",
  "روز خلیج فارس"
 ],
 "2/12": [
  "Teacher Day",
  "روز معلم"
 ],
 "2/25": [
  "Ferdowsi Day",
  "بزرگداشت فردوسی"
 ],
 "2/28": [
  "Khayyam Day",
  "بزرگداشت خیام"
 ],
 "2/31": [
  "Organ Donation Day",
  "روز اهدای عضو"
 ],
 "3/3": [
  "Khorramshahr Liberation Day",
  "آزادسازی خرمشهر"
 ],
 "4/14": [
  "Pen Day",
  "روز قلم"
 ],
 "4/22": [
  "IT Day",
  "روز فناوری اطلاعات"
 ],
 "4/25": [
  "Welfare Day",
  "روز بهزیستی"
 ],
 "5/9": [
  "Blood Donation Day",
  "روز اهدای خون"
 ],
 "5/14": [
  "Constitutional Revolution Day",
  "روز مشروطیت"
 ],
 "5/17": [
  "Journalist Day",
  "روز خبرنگار"
 ],
 "6/1": [
  "Physician Day",
  "روز پزشک"
 ],
 "6/4": [
  "Employee Day",
  "روز کارمند"
 ],
 "6/5": [
  "Pharmacist Day",
  "روز داروساز"
 ],
 "6/12": [
  "Community Health Worker Day",
  "روز بهورز"
 ],
 "6/21": [
  "Cinema Day",
  "روز سینما"
 ],
 "6/26": [
  "Emergency Medicine Day",
  "روز اورژانس"
 ],
 "6/27": [
  "Persian Poetry Day",
  "روز شعر و ادب فارسی"
 ],
 "6/31": [
  "Sacred Defence Week",
  "آغاز هفتهٔ دفاع مقدس"
 ],
 "7/1": [
  "Flag Day",
  "روز پرچم"
 ],
 "7/5": [
  "Tourism Day",
  "روز گردشگری"
 ],
 "7/7": [
  "Firefighter Day",
  "روز آتش‌نشانی"
 ],
 "7/8": [
  "Rumi Day",
  "بزرگداشت مولوی"
 ],
 "7/14": [
  "Veterinary Day",
  "روز دامپزشکی"
 ],
 "7/20": [
  "Hafez Day",
  "بزرگداشت حافظ"
 ],
 "7/26": [
  "Sport Day",
  "روز ورزش"
 ],
 "8/13": [
  "School Student Day",
  "روز دانش‌آموز"
 ],
 "8/14": [
  "Public Culture Day",
  "روز فرهنگ عمومی"
 ],
 "8/24": [
  "Book Day",
  "روز کتاب"
 ],
 "9/16": [
  "University Student Day",
  "روز دانشجو"
 ],
 "9/25": [
  "Research Day",
  "روز پژوهش"
 ],
 "9/30": [
  "Yalda Night",
  "شب یلدا"
 ],
 "10/5": [
  "Earthquake Safety Day",
  "روز ایمنی در برابر زلزله"
 ],
 "11/12": [
  "Fajr Decade",
  "آغاز دههٔ فجر"
 ],
 "12/5": [
  "Engineer Day",
  "روز مهندس"
 ],
 "12/15": [
  "Tree Planting Day",
  "روز درختکاری"
 ],
 "12/16": [
  "Nutritionist Day",
  "روز متخصص تغذیه"
 ],
 "12/25": [
  "Parvin Etesami Day",
  "بزرگداشت پروین اعتصامی"
 ]
};
const LUNAR_OCCASIONS={1405:{
 "1/30": [
  "Masoumeh birthday",
  "ولادت حضرت معصومه"
 ],
 "2/9": [
  "Imam Reza birthday",
  "ولادت امام رضا"
 ],
 "2/27": [
  "Imam Javad memorial",
  "شهادت امام جواد"
 ],
 "2/28": [
  "Marriage Day",
  "روز ازدواج"
 ],
 "3/3": [
  "Imam Baqir memorial",
  "شهادت امام باقر"
 ],
 "3/5": [
  "Arafah",
  "روز عرفه"
 ],
 "3/11": [
  "Imam Hadi birthday",
  "ولادت امام هادی"
 ],
 "3/16": [
  "Imam Kazem birthday",
  "ولادت امام کاظم"
 ],
 "3/20": [
  "Mubahala",
  "روز مباهله"
 ],
 "3/21": [
  "Family Day",
  "روز خانواده"
 ],
 "4/6": [
  "Imam Sajjad memorial",
  "شهادت امام سجاد"
 ],
 "4/19": [
  "Imam Sajjad memorial (another tradition)",
  "شهادت امام سجاد (به روایتی)"
 ],
 "4/31": [
  "Imam Hasan memorial (another tradition)",
  "شهادت امام حسن (به روایتی)"
 ],
 "6/3": [
  "Prophet birthday (Sunni tradition)",
  "میلاد پیامبر (روایت اهل سنت)"
 ],
 "6/29": [
  "Imam Hasan Askari birthday",
  "ولادت امام حسن عسکری"
 ],
 "6/31": [
  "Masoumeh memorial",
  "وفات حضرت معصومه"
 ],
 "7/24": [
  "Zaynab birthday · Nurse Day",
  "ولادت حضرت زینب · روز پرستار"
 ],
 "8/2": [
  "Fatimah memorial (another tradition)",
  "شهادت حضرت فاطمه (به روایتی)"
 ],
 "9/2": [
  "Umm al-Banin memorial",
  "وفات حضرت ام‌البنین"
 ],
 "9/9": [
  "Fatimah birthday · Mother’s Day",
  "ولادت حضرت فاطمه · روز مادر"
 ],
 "9/20": [
  "Imam Baqir birthday",
  "ولادت امام باقر"
 ],
 "9/22": [
  "Imam Hadi memorial",
  "شهادت امام هادی"
 ],
 "9/29": [
  "Imam Javad birthday",
  "ولادت امام جواد"
 ],
 "10/4": [
  "Zaynab memorial",
  "وفات حضرت زینب"
 ],
 "10/14": [
  "Imam Kazem memorial",
  "شهادت امام کاظم"
 ],
 "10/22": [
  "Imam Hossein birthday",
  "ولادت امام حسین"
 ],
 "10/23": [
  "Abbas birthday",
  "ولادت حضرت عباس"
 ],
 "10/24": [
  "Imam Sajjad birthday",
  "ولادت امام سجاد"
 ],
 "10/30": [
  "Ali Akbar birthday · Youth Day",
  "ولادت حضرت علی‌اکبر · روز جوان"
 ],
 "11/19": [
  "Ramadan begins",
  "آغاز ماه رمضان"
 ],
 "11/28": [
  "Khadijah memorial",
  "وفات حضرت خدیجه"
 ],
 "12/3": [
  "Imam Hasan birthday",
  "ولادت امام حسن"
 ],
 "12/6": [
  "Qadr Night",
  "شب قدر"
 ],
 "12/7": [
  "Imam Ali wounded",
  "ضربت خوردن امام علی"
 ],
 "12/8": [
  "Qadr Night",
  "شب قدر"
 ],
 "12/10": [
  "Qadr Night",
  "شب قدر"
 ],
 "12/14": [
  "Quds Day",
  "روز قدس"
 ]
}};
const GREGORIAN_OCCASIONS={
 "4/7": [
  "Health Day",
  "روز سلامتی"
 ],
 "5/1": [
  "Labour Day",
  "روز کارگر"
 ],
 "5/5": [
  "Midwives Day",
  "روز ماما"
 ],
 "5/8": [
  "Red Crescent Day",
  "روز هلال احمر"
 ],
 "6/5": [
  "Environment Day",
  "روز محیط زیست"
 ],
 "12/1": [
  "HIV Awareness Day",
  "روز مبارزه با ایدز"
 ]
};
const CALENDAR_SOURCE='https://calendar.ut.ac.ir/documents/2139738/7092644/Calendar-1405.pdf/64228cbb-f4de-dc32-4d2b-57db3c8e322f?t=1761972997587';
function calendarEvents(d){if(S.holidays===false)return[];const j=jp(d),key=j.m+'/'+j.d,result=[];
 for(const [type,table,holiday] of [['national',SOLAR_HOLIDAYS,true],['religious',LUNAR_HOLIDAYS[j.y]||{},true],['national',SOLAR_OCCASIONS,false],['religious',LUNAR_OCCASIONS[j.y]||{},false]]){const pair=table[key];if(pair)result.push({type,holiday,label:S.lang==='fa'?pair[1]:pair[0]})}
 const pair=GREGORIAN_OCCASIONS[(d.getMonth()+1)+'/'+d.getDate()];if(pair)result.push({type:'international',holiday:false,label:S.lang==='fa'?pair[1]:pair[0]});
 return result;
}
