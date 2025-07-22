// Files under mckimcreed folder
// createdtimestamp,hourminute,siteid,flow_gpm,pressure_psi,source
export interface CSV_TYPE_1 {
  createdtimestamp?: string;
  hourminute?: string;
  siteid?: string;
  flow_gpm?: number;
  pressure_psi?: number;
  source?: string;
}

// ISOIL
// No	Date	Time	T+ Totalizer		P+ Totalizer		T- Totalizer		P- Totalizer		T NET Totalizer		P NET Totalizer		Flow rate		Flow rate %		ALARMS		Loss of current		Time rise A		Time rise B		Sensor test error code		Voltage  Electrode E1		Voltage  Electrode E2		E1 E2 Differential voltage		Common mode voltage		Low-frequency noise		High frequency noise		Resistance on electrode 1		Resistance on electrode 2		Coils excitation current		Resistance of the excitation circuit		Temperature- sensor coils		Analog input 1		Analog input 2		CPU temperature		NA		+ supply voltage  analog		- supply voltage  analog		NA		NA		UM (V) and battery volt		% Battery charge		Checksum
export interface CSV_TYPE_2 {
  no: string;
  date: string;
  time: string;
  tTotalizer: number;
  pTotalizer: number;
  tNetTotalizer: number;
  pNetTotalizer: number;
  flowRate: number;
  flowRatePercent: number;
  alarms: string;
  lossOfCurrent: string;
  timeRiseA: string;
  timeRiseB: string;
  sensorTestErrorCode: string;
  voltageElectrodeE1: number;
  voltageElectrodeE2: number;
  e1e2DifferentialVoltage: number;
  commonModeVoltage: number;
  lowFrequencyNoise: number;
  highFrequencyNoise: number;
  resistanceOnElectrode1: number;
  resistanceOnElectrode2: number;
  coilsExcitationCurrent: number;
  resistanceOfExcitationCircuit: number;
  temperatureSensorCoils: number;
  analogInput1: number;
  analogInput2: number;
  cpuTemperature: number;
  na1: string;
  supplyVoltageAnalogPlus: number;
  supplyVoltageAnalogMinus: number;
  na2: string;
  na3: string;
  umVAndBatteryVolt: number;
  batteryChargePercent: number;
  checksum: string;
}
