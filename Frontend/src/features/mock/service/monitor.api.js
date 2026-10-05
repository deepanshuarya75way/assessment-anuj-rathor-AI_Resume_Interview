import api from "../../../utils/api.js";

export const sendMonitorEvent = async({sessionId,type}) =>{
  try{
    const res = await api.post("/api/monitor/event",{
      sessionId,
      type
    });
    return res.data;
  }
  catch(err){
    console.error("Failed to send monitor event",err);
  }
}