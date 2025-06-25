import schedule from 'node-schedule';

import { ScheduleModel } from "./models.js"


interface ScheduleJob {
  id: string;
  job: schedule.Job | null;
  inputs: any
}

const scheduleMap = new Map<string, ScheduleJob>();
const _getCronExpression = (model: ScheduleModel) => {

  //* * * * * *
  // ┬ ┬ ┬ ┬ ┬ ┬
  // │ │ │ │ │ └─ 요일 (0 - 7) (0 또는 7은 일요일)
  // │ │ │ │ └───── 월 (1 - 12)
  // │ │ │ └────────── 일 (1 - 31)
  // │ │ └─────────────── 시 (0 - 23)
  // │ └──────────────────── 분 (0 - 59)
  // └───────────────────────── 초 (0 - 59, 선택 사항)

  var type = model.ScheduleSetting?.ScheduleType;
  var sec = '';
  var min = '*';
  var hour = '*';
  var day = '*';
  var month = '*';
  var week = '*';

  if (type === "SCHDTYPE1") {//매일 반복

    var intervalType = model.ScheduleSetting?.IntervalType;
    var Interval = model.ScheduleSetting?.IntervalTime;
    if (intervalType === "INTERVALTYPE1") sec = `*/${Interval}`;
    else if (intervalType === "INTERVALTYPE2") min = `*/${Interval}`;
    else if (intervalType === "INTERVALTYPE3") {
      min = '0';
      hour == `*/${Interval}`;
    }
  }
  if (type === "SCHDTYPE5") {//매월

    if (model.ScheduleSetting?.Day)
      day = model.ScheduleSetting?.Day?.toString()
  }
  if (type === "SCHDTYPE4") {//매주
    var weekType = model.ScheduleSetting?.Week;
    if (weekType) {

      if (weekType === "Sunday") week = "0";
      else if (weekType === "Monday") week = "1"
      else if (weekType === "Tuesday") week = "2"
      else if (weekType === "Wednesday") week = "3"
      else if (weekType === "Thursday") week = "4"
      else if (weekType === "Friday") week = "5"
      else if (weekType === "Saturday") week = "6"
    }
  }
  if (type === "SCHDTYPE2") {//특정일
    var dateSplit = model.ScheduleSetting?.Date?.split("-")
    if (dateSplit?.length === 3) {
      month = parseInt(dateSplit[1]).toString();
      day = parseInt(dateSplit[2]).toString();
    }
  }
  if (type !== "SCHDTYPE1") {
    var timeSplit = model.ScheduleSetting?.Time?.split(":");
    if (timeSplit?.length === 2) {
      hour = parseInt(timeSplit[0]).toString();
      min = parseInt(timeSplit[1]).toString();
    }
  }

  return `${sec} ${min} ${hour} ${day} ${month} ${week}`.trim();
}
export const GetSchedule = (id: string) => {
  
  return scheduleMap.get(id);
}
//스케쥴 등록
export const RegisterSchedule = async (
  model: ScheduleModel
  , inputs: any
  , action: Function

) => {
  if (scheduleMap.has(model.ID)) {
    await DeleteSchedule(model.ID)
  }
  var cronExpression = _getCronExpression(model);

  const job = schedule.scheduleJob(cronExpression, (fireDate: Date) => {

    if (model.ScheduleSetting?.ScheduleType === "SCHDTYPE1") {

      var splitStart = model.ScheduleSetting.IntervalStartTime?.split(":");
      var splitEnd = model.ScheduleSetting.IntervalEndTime?.split(":");

      if (splitStart?.length === 2 && splitEnd?.length === 2) {
        var startHour = parseInt(splitStart[0]);
        var startMin = parseInt(splitStart[1]);
        var endHour = parseInt(splitEnd[0]);
        var endMin = parseInt(splitEnd[1]);
        const now = new Date();
        var startTotalMin = startHour * 60 + startMin;
        var endTotalMin = endHour * 60 + endMin;
        var currentTotalMin = now.getHours() * 60 + now.getMinutes();

        if (currentTotalMin < startTotalMin) {
          return;
        }
        if (currentTotalMin > endTotalMin) {
          return;

        }

      }
    }

    if (action) {
      action();
    }
  });
  scheduleMap.set(model.ID, { id: model.ID, job: job, inputs: inputs });
};



//스케쥴 삭제
export const DeleteSchedule = async (id: string) => {
  const scheduleJob = scheduleMap.get(id);
  
  if (scheduleJob && scheduleJob.job) {
    scheduleJob.job.cancel();
    scheduleMap.delete(id);
  }
};
