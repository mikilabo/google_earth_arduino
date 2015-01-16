#include <aJSON.h>
#include <stdio.h>
#include <I2Cdev.h>
#include <Wire.h>
#include "MPU6050_6Axis_MotionApps20.h"


// class default I2C address is 0x68
// specific I2C addresses may be passed as a parameter here
// AD0 low = 0x68 (default for InvenSense evaluation board)
// AD0 high = 0x69
MPU6050 accelgyro;

int16_t ax, ay, az;
int16_t gx, gy, gz;

//Button
const int LED = 13;
const int BUTTON1 = 8;
const int BUTTON2 = 9;
const int BUTTON3 = 10;

int contButton = 0;
int lastContButton = 0;
unsigned long contButtonTimer = 0;
int contLongPushed=0;

int opeButton[2];
int lastOpeButton[2];
unsigned long opeButtonTimer[2];

void setup(){
  Wire.begin();
  Serial.begin(38400);
  
  pinMode(BUTTON1, INPUT);
  pinMode(BUTTON2, INPUT);
  pinMode(BUTTON3, INPUT);
  
  // initialize device
  Serial.println("Initializing I2C devices...");
  accelgyro.initialize();

  // verify connection
  Serial.println("Testing device connections...");
  Serial.println(accelgyro.testConnection() ? \
          "MPU6050 connection successful" : "MPU6050 connection failed");

  accelgyro.dmpInitialize();  
  
  // Wait for sensor to stabilize
  delay(500); 
  
}

void loop(){
  int counter;
  contButton = digitalRead(BUTTON1);
  opeButton[0] = digitalRead(BUTTON2);
  opeButton[1] = digitalRead(BUTTON3);
  counter = contButton + opeButton[0] + opeButton[1]; 
     
  /* 
  Serial.print(contButton);
  Serial.print(addButton);
  Serial.println(subButton);
  */   

  //control Button status check 
  if( counter < 2 ){
    controlButtonStatusCheck();
   
    //sub button check 
    opeButtonStatusCheck(&opeButton[0], &lastOpeButton[0], &opeButtonTimer[0], 1 );
    
    //add button check 
    opeButtonStatusCheck(&opeButton[1], &lastOpeButton[1], &opeButtonTimer[1], 2 );
  }

  //no button pushed, check the gyro status
  if(counter == 0 ){
    gyroCheck();
  }

}

/**
 * operation Button status check 
 */
void opeButtonStatusCheck(int *buttonStatus, 
                          int *lastStatus, 
                          unsigned long *myTimer,
                          int type){
  aJsonObject* aJsonButton = aJson.createObject();
  aJson.addNumberToObject(aJsonButton,"ctrl", 2);
  int isStr = 0;
  
  /*
  Serial.print(*buttonStatus);
  Serial.print(*lastStatus);
  Serial.print(" ");
  Serial.println(*myTimer);
  */
  if(*buttonStatus != *lastStatus ){
    //status changed
    if(*buttonStatus == HIGH){
      //button pushed
      //timer start
      *myTimer = millis();
    }
    //keep status
    *lastStatus = *buttonStatus;
    delay(5); // anti chattering    
  }else{
    //same status
    if(*buttonStatus == HIGH){
      //still button pushed, sending info to server
      unsigned long diffs = millis() - *myTimer;        
      aJson.addNumberToObject(aJsonButton,"timer", (int)diffs);
      aJson.addNumberToObject(aJsonButton,"type", type);
      isStr = 1;
    }
  }
  //sending command to server 
  if(isStr){
    char* jsonStr = aJson.print(aJsonButton);
     Serial.println(jsonStr);
     free(jsonStr);
     delay(50); //make delay 
  }
  aJson.deleteItem(aJsonButton);  
}

/*
 * control Button status Check 
 */ 
void controlButtonStatusCheck(){
    aJsonObject* aJsonButton = aJson.createObject();
    aJson.addNumberToObject(aJsonButton,"ctrl", 1);
    int isStr = 0;
    
    //control Button status check 
    if(contButton != lastContButton){
      //Cont Button status changed
      if(contButton == HIGH){
        contButtonTimer = millis();
      }else{
        if( contLongPushed == 0 ){
          //Serial.println("cont Button clicked");
          aJson.addNumberToObject(aJsonButton,"contButton", 1);
          isStr = 1;
        }else{
          contLongPushed = 0;
        }
      }
      lastContButton = contButton;
      delay(5); // anti chattering  
    }else{
      //Cont Button status unchanged
      unsigned long timer = millis();
      if( millis() - contButtonTimer > 2000 && (contButton == HIGH )){
        //more than 2 sec pushed
        if(contLongPushed == 0){
          //Serial.println(" cont Button long psushed1");
          aJson.addNumberToObject(aJsonButton,"contButton", 2);
          isStr = 1;
          contLongPushed = 1;
        }
      }
    }
    
    //sending command to server 
    if(isStr){
      char* jsonStr = aJson.print(aJsonButton);
      Serial.println(jsonStr);
      free(jsonStr);
    }
    aJson.deleteItem(aJsonButton);
}

/*
 * gyro Status check and sending to Server 
 */
void gyroCheck(){
    // read raw accel/gyro measurements from device
    accelgyro.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);

    // these methods (and a few others) are also available
    //accelgyro.getAcceleration(&ax, &ay, &az);
    //accelgyro.getRotation(&gx, &gy, &gz);
    
    int accXangle=0, accYangle = 0;
    for(int i=0; i < 10; i++){
      accXangle += (atan2(ay,az)+PI)*RAD_TO_DEG;
      accYangle += (atan2(ax,az)+PI)*RAD_TO_DEG;
      delay(5);
    }
    accXangle = accXangle/10 - 180;
    accYangle = accYangle/10 - 180;
    
    //no angle -> do not send data 
    if( abs(accXangle) >= 5 || abs(accYangle) >= 6 ){
      aJsonObject* aJosnAngle = aJson.createObject();
      aJson.addNumberToObject(aJosnAngle,"ctrl", 3);
      aJson.addNumberToObject(aJosnAngle,"accXangle", accXangle);
      aJson.addNumberToObject(aJosnAngle,"accYangle", accYangle);
      char* jsonStr = aJson.print(aJosnAngle);
      Serial.println(jsonStr);
      aJson.deleteItem(aJosnAngle); free(jsonStr);
    }
    
  
    // display tab-separated accel/gyro x/y/z values
/*
    Serial.print("a/g:\t");
    Serial.print(ax); Serial.print("\t");
    Serial.print(ay); Serial.print("\t");
    Serial.print(az); Serial.print("\t");
    Serial.print(gx); Serial.print("\t");
    Serial.print(gy); Serial.print("\t");
    Serial.print(gz); Serial.print("\t");
*/
/*
    Serial.print(accXangle); Serial.print("\t");
    Serial.print(accYangle); Serial.print("\t");
*/
    //Serial.print(i++); Serial.print("\t");
    //Serial.println();
    
    //delay(1000);   
    
}


