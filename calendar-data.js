/* Official Iranian calendar, 1405, University of Tehran Calendar Center.
   Source: https://calendar.ut.ac.ir/documents/2139738/7092644/Calendar-1405.pdf
   Text mirror: https://www.scribd.com/document/990789768/Calendar-1405
   Lunar dates apply ONLY to 1405; fixed solar holidays recur. */
const SOLAR_HOLIDAYS={
 '1/1':['Nowruz','نوروز'],'1/2':['Nowruz','نوروز'],'1/3':['Nowruz','نوروز'],'1/4':['Nowruz','نوروز'],
 '1/12':['Islamic Republic Day','روز جمهوری اسلامی'],'1/13':['Nature Day','روز طبیعت'],
 '3/14':['Khomeini memorial','رحلت امام خمینی'],'3/15':['15 Khordad','قیام ۱۵ خرداد'],
 '11/22':['Revolution Day','پیروزی انقلاب اسلامی'],'12/29':['Oil Nationalization Day','ملی شدن صنعت نفت']
};
const LUNAR_HOLIDAYS={1405:{
 '1/1':['Eid al-Fitr','عید فطر'],'1/2':['Eid al-Fitr holiday','تعطیل عید فطر'],
 '1/25':['Imam Sadegh memorial','شهادت امام جعفر صادق'],
 '3/6':['Eid al-Adha','عید قربان'],'3/14':['Eid al-Ghadir','عید غدیر'],
 '4/3':['Tasua','تاسوعا'],'4/4':['Ashura','عاشورا'],'5/13':['Arbaeen','اربعین'],
 '5/21':['Prophet and Imam Hasan memorial','رحلت پیامبر و شهادت امام حسن'],
 '5/22':['Imam Reza memorial','شهادت امام رضا'],'5/30':['Imam Hasan Askari memorial','شهادت امام حسن عسکری'],
 '6/8':['Prophet and Imam Sadegh birthday','میلاد پیامبر و امام جعفر صادق'],
 '8/22':['Fatimah memorial','شهادت حضرت فاطمه'],'10/2':['Imam Ali birthday','ولادت امام علی'],
 '10/16':['Mabath','مبعث پیامبر'],'11/4':['Mid-Shaban','نیمهٔ شعبان'],
 '12/9':['Imam Ali memorial','شهادت امام علی'],'12/19':['Eid al-Fitr','عید فطر'],'12/20':['Eid al-Fitr holiday','تعطیل عید فطر']
}};
function isWeekend(d){return (S.weekend||[5]).includes(d.getDay())}
function holidayInfo(d){if(S.holidays===false)return [];const j=jp(d),key=j.m+'/'+j.d;return [SOLAR_HOLIDAYS[key],LUNAR_HOLIDAYS[j.y]?.[key]].filter(Boolean).map(x=>S.lang==='fa'?x[1]:x[0])}
