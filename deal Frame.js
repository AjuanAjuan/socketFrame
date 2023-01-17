let TransactionID = 0 // 发送编号

// 帧数据处理
let SendArray = (CmdCode, Args) => {
  let PackDoneArray = packArray(CmdCode, Args);
  if (PackDoneArray && (PackDoneArray.length > 0)) {
    TransactionID++;
    return PackDoneArray
  }
}

// (string=>Arr)
let packArray = (CmdCode, Args = null) => {
  if (Args !== null) {
    let len = parseInt(JSON.stringify(Args).length) * 2;
    let arr = AddValidationMsg(CmdCode, len + 36);
    StringToByte('' + JSON.stringify(Args), arr, len, 36);
    return arr;
  } else {
    let arr = AddValidationMsg(CmdCode, 36);
    return arr;
  }
}

// 数据添加36位验证头部信息
function AddValidationMsg (SendCode, len) {
  let PackArray = new Uint8Array(len);
  PackArray[0] = 0xEA;
  PackArray[1] = 0xFA;
  PackArray[2] = 0xCB;
  PackArray[3] = 0xDE;
  if (sessionStorage.getItem('Conid') !== null) {
    let Conid = Uint32ToUint8(sessionStorage.getItem('Conid'));
    for (let i = 0; i < 4; i++) {
      PackArray[4 + i] = Conid[i];
    }
  }
  let DwTransactionIDArr = Uint32ToUint8(TransactionID);
  for (let i = 0; i < 4; i++) {
    PackArray[12 + i] = DwTransactionIDArr[i];
  }
  let pDataSendCodeArray = HandleAppFrame(SendCode);
  PackArray[16] = pDataSendCodeArray[3];
  PackArray[17] = pDataSendCodeArray[2];
  let pDataLenArray = HandleAppFrame(len - 36);
  PackArray[32] = pDataLenArray[3];
  PackArray[33] = pDataLenArray[2];
  PackArray[34] = pDataLenArray[1];
  PackArray[35] = pDataLenArray[0]
  return PackArray
}
// 处理命令码和数据长度数据
let HandleAppFrame = (num) => {
  let BinaryString = num.toString(2);
  let inl = 32 - BinaryString.length;
  for (let i = 0; i < inl; i++) {
    BinaryString = '0' + BinaryString
  }
  let HandleArray = [];
  let Str1 = BinaryString.substr(0, 8);
  let Str2 = BinaryString.substr(8, 8);
  let Str3 = BinaryString.substr(16, 8);
  let Str4 = BinaryString.substr(24, 8);
  HandleArray.push(parseInt(Str1, 2));// 截取8位二进制做数据位
  HandleArray.push(parseInt(Str2, 2));
  HandleArray.push(parseInt(Str3, 2));
  HandleArray.push(parseInt(Str4, 2))
  return HandleArray
}
// uint32转uint8
let Uint32ToUint8 = (Uint32Num) => {
  let buffer = new ArrayBuffer(4);
  new DataView(buffer).setUint32(0, Uint32Num, true);
  return (new Uint8Array(buffer));
}
// 字符串转byte
let StringToByte = (Str, Array, ArrayLen, Offset) => {
  let U16Num = new Uint16Array(Str.length);
  let U8Num = new Uint8Array((Str.length) * 2);
  for (let i = 0; i < Str.length; i++) {
    let val = Str.charCodeAt(i).toString(10);
    U16Num[i] = parseInt(val);
    U8Num[2 * i] = U16Num[i] >> 0;
    U8Num[2 * i + 1] = U16Num[i] >> 8;
  }
  let Temp = U8Num;
  for (let i = 0; i < ArrayLen; i++) {
    Array[Offset + i] = Temp[i];
  }
}

export {SendArray}
