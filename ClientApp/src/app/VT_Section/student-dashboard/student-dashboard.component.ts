import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/shared/api.service';
import { AuthserviceService } from 'src/app/shared/authservice.service';
import { NgxImageCompressService } from 'ngx-image-compress';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent {

  studentData !: any;
  selectedStudent: any;
  studentDataFromJson: any;
  email!: string; //display emailid of vt to student dashboard
  showDailyDiarySection: boolean = false;
  MonthDaysData: string[] = ['MonthDay1', 'MonthDay2', 'MonthDay3', 'MonthDay4', 'MonthDay5', 'MonthDay6', 'MonthDay7', 'MonthDay8', 'MonthDay9'];
  HoursData: string[] = ['Hour1', 'Hour2', 'Hour3', 'Hour4', 'Hour5', 'Hour6', 'Hour7', 'Hour8', 'Hour9'];
  MinutesData: string[] = ['Minutes1', 'Minutes2', 'Minutes3', 'Minutes4', 'Minutes5', 'Minutes6', 'Minutes7', 'Minutes8', 'Minutes9'];
  // Task1TickData: string[] = ['Task1Tick1','Task1Tick2','Task1Tick3','Task1Tick4','Task1Tick5','Task1Tick6','Task1Tick7','Task1Tick8','Task1Tick9','Task1Tick10','Task1Tick11','Task1Tick12','Task1Tick13']
  taskData: any[] | undefined;
  selectedImage: File | null = null;
  compressedBase64: string | null = null;
  stud_Id: any;
  isIdMatching: boolean = false;
  public sortedData: TaskData[] = [];
  showFinalDDTable: boolean = false;

  constructor(private apiservice: ApiService,
    private router: Router,
    private authservice: AuthserviceService,
    private imageCompressService: NgxImageCompressService

  ) { }

  ngOnInit(): void {
    this.getAllStudents();
    this.email = this.authservice.getEmail();//display emailid of vt to student dashboard
    //this.Final_DailyDiary_Record();
  }

  getAllStudents() {
    this.apiservice.getStudents().subscribe((res: any) => {

      this.studentData = res.studentDetails;
      console.log(res.studentDetails);
    })
  }
  selectStudent(id: number): void {
    // Reset previous data
    this.selectedStudent = null;
    this.stud_Id = null;
    this.studentDataFromJson = null;
    this.showDailyDiarySection = false;
    this.showFinalDDTable = false;
    this.isIdMatching = false;
    
    // Reset sortedData array to get new record when new student is selected
    this.sortedData = [];

    this.apiservice.getStudentById(id).subscribe({
      next: (res) => {
        this.selectedStudent = res.studentDetails;
        this.stud_Id = id;  // Set stud_Id here
        console.log(this.selectedStudent);
        console.log("stu_id", this.stud_Id);
      },
      error: (error) => {
        console.error('Error in selectStudent:', error);
      }
    });
  }

  clearSelectedStudent() {
    this.selectedStudent = null;
  }
  go_to_login() {
    this.router.navigate(['/vt_login'])
  }

  //select image
  onFileSelected(event: any): void {
    const files = event.target.files;
    this.selectedImage = files && files.length > 0 ? files[0] : null;

    if (this.selectedImage) {
      const originalSizeInBytes = this.selectedImage.size;
      const originalSizeInKB = originalSizeInBytes / 1024;
      console.log('Original Image Size:', originalSizeInKB.toFixed(2), 'KB');
      this.compressAndUpload(); //call function to compress and upload image on http post
    }
  }

  //function to compress image and upload it
  compressAndUpload(): void {
    if (this.selectedImage) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.imageCompressService
          .compressFile(base64String, -1, 60, 60)
          .then((compressedBase64: string) => {
            const compressedSizeInBytes = compressedBase64.length;
            const compressedSizeInKB = compressedSizeInBytes / 1024;
            console.log('Compressed Image Size:', compressedSizeInKB.toFixed(2), 'KB');
            this.compressedBase64 = compressedBase64;
            // Call your API service here to send the compressed image
            this.onUploadAndProcessData();
          })
          .catch((error) => {
            console.error('Image Compression Error:', error);
          });
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }

  //send upload file to http post and get json data and show in table
  onUploadAndProcessData(): void {
    if (this.compressedBase64) {
      console.log('Sending Compressed Image Size:', this.compressedBase64.length / 1024, 'KB');
      // Call your API service to upload the compressed image
      this.apiservice.uploadCompressedImg(this.compressedBase64.split(',')[1]).subscribe({
        next: (response) => {
          console.log('API Response:', response);

          //getting Student_Id from json api rsponse
          const jsonstudentID = Number(response.fieldInfo.StudentID);

          console.log('jsonstudentID:', jsonstudentID);

          if (!isNaN(jsonstudentID) && jsonstudentID === this.stud_Id) {
            console.log("id matching");
            alert("Record Found !!Fetching Details..Please wait");
            this.isIdMatching = true;
            this.studentDataFromJson = response;
            this.jsonData();
            this.Final_DailyDiary_Record();
            //this.populateSortedData();
            this.showDailyDiarySection = true;
          } else {
            console.log("Id not matching");
            alert("Student Id Is not Matching.Sorry!!")
          }

        },
        error: (error) => {
          console.error('API Error:', error);
        },
      });
    }
  }
  //function getting json 
  private jsonData(): void {
    if (this.studentDataFromJson) {
      console.log("jsonData=", this.studentDataFromJson);
      const tasks = ['Task1', 'Task2', 'Task3', 'Task4', 'Task5', 'Task6', 'Task7'];
      const taskData: any[] = [];

      tasks.forEach((task) => {
        const taskName = this.studentDataFromJson.fieldInfo[`TaskName${task.substring(4)}`];

        // Skip if TaskName is empty
        if (!taskName) {
          return;
        }

        const taskTicks: number[] = [];

        for (let i = 1; i <= 9; i++) {
          const tickKey = `${task}Tick${i}`;
          const monthDayKey = `MonthDay${i}`;
          const hourKey = `Hour${i}`;
          const minuteKey = `Minutes${i}`;
          const performedValue = this.studentDataFromJson.fieldInfo[tickKey] === '1' ? 1 : 0;

          taskTicks.push(performedValue);
        }

        const taskObj = {
          TaskName: taskName,
          TaskTicks: taskTicks,
        };

        taskData.push(taskObj);
      });
      // use taskData to display in the template
      this.taskData = taskData;
    }
  }
  //here sotrted data from json file to send to backend
  //sorted data as as method/function
  private Final_DailyDiary_Record(): void {
    if (this.studentDataFromJson) {
      const tasks = ['Task1', 'Task2', 'Task3', 'Task4', 'Task5', 'Task6', 'Task7'];
      //const sortedData: TaskData[] = []; 

      // Extract the 'Year' and 'Month' from the scanned file
      const year = this.studentDataFromJson.fieldInfo['Year'];
      const month = this.studentDataFromJson.fieldInfo['Month'];

      tasks.forEach((task) => {
        const taskName = this.studentDataFromJson.fieldInfo[`TaskName${task.substring(4)}`];
        // console.log("TaskName=",taskName);

        // Skip if TaskName is empty
        if (!taskName) {
          return;
        }

        const taskTicks: number[] = [];

        for (let i = 1; i <= 9; i++) {
          const tickKey = `${task}Tick${i}`;
          const monthDayKey = `MonthDay${i}`;
          const hourKey = `Hour${i}`;
          const minuteKey = `Minutes${i}`;
          const performedValue = this.studentDataFromJson.fieldInfo[tickKey] === '1' ? 'Yes' : 'No';
          //  console.log("Tick",this.studentDataFromJson.fieldInfo[tickKey]);

          // taskTicks.push(performedValue);
          // Only include tasks with tick value 1
          if (performedValue === 'Yes') {
            const monthDayValue = this.studentDataFromJson.fieldInfo[monthDayKey];
            const hourValue = this.studentDataFromJson.fieldInfo[hourKey];
            const minuteValue = this.studentDataFromJson.fieldInfo[minuteKey];

            const minutesPresent = minuteValue !== ''; // Check if minutes are present

            // Form the date string directly
            const date = `${year}-${month}-${monthDayValue}`;

            const taskObj = {
              TaskName: taskName,
              Performed: performedValue,
              Date: date,
              hour: hourValue,
              Minutes: minutesPresent ? minuteValue : '00', // Include only if minutes are present
              Stud_Id: this.stud_Id
            };

            // Check if the task is already in the sortedData array
            const existingTask = this.sortedData.find((item) => item.TaskName === taskName && item.Date === date);

            if (!existingTask) {
              this.sortedData.push(taskObj);
            }
          }
        }
      });

      // Sort the array based on TaskName, Date
      this.sortedData.sort((a, b) => {
        const taskNameComparison = a.TaskName.localeCompare(b.TaskName);
        return taskNameComparison === 0 ? a.Date.localeCompare(b.Date) : taskNameComparison;
      });

      console.log("sortedData =", this.sortedData);

      this.addingDailyDiaryRecord(this.sortedData);
    }
  }

  finalDDTableRecord() {
    this.showFinalDDTable = !this.showFinalDDTable;
    alert("Fetching Latest Record Submitted To Daily Diary..Please Wait !!");
  }
  private refreshSortedData() {
    // Call the function to fetch and process the data
    this.Final_DailyDiary_Record();
  }
  // Define sortedData as a method to populate the array
  // populateSortedData(): void {
  //   if (this.studentDataFromJson) {
  //     const tasks = ['Task1', 'Task2', 'Task3', 'Task4', 'Task5', 'Task6'];
  //     // Clear sortedData before populating
  //     this.sortedData1 = [];

  //     // Extract the 'Year' and 'Month' from the scanned file
  //     const year = this.studentDataFromJson.fieldInfo['Year'];
  //     const month = this.studentDataFromJson.fieldInfo['Month'];

  //     tasks.forEach((task) => {
  //       const taskName = this.studentDataFromJson.fieldInfo[`TaskName${task.substring(4)}`];

  //       // Skip if TaskName is empty
  //       if (!taskName) {
  //         return;
  //       }

  //       for (let i = 1; i <= 9; i++) {
  //         const tickKey = `${task}Tick${i}`;
  //         const monthDayKey = `MonthDay${i}`;
  //         const hourKey = `Hour${i}`;
  //         const minuteKey = `Minutes${i}`;
  //         const performedValue = this.studentDataFromJson.fieldInfo[tickKey] === '1' ? 'Yes' : 'No';

  //         // Only include tasks with tick value 1
  //         if (performedValue === 'Yes') {
  //           const monthDayValue = this.studentDataFromJson.fieldInfo[monthDayKey];
  //           const hourValue = this.studentDataFromJson.fieldInfo[hourKey];
  //           const minuteValue = this.studentDataFromJson.fieldInfo[minuteKey];

  //           const minutesPresent = minuteValue !== ''; // Check if minutes are present

  //           // Form the date string directly
  //           const date = `${year}-${month}-${monthDayValue}`;

  //           const taskObj: TaskData = {
  //             TaskName: taskName,
  //             Performed: performedValue,
  //             Date: date,
  //             hour: hourValue,
  //             Minutes: minutesPresent ? minuteValue : '00', // Include only if minutes are present
  //             Stud_Id: this.stud_Id
  //           };

  //           // Check if the task is already in the sortedData array
  //           const existingTask = this.sortedData1.find((item) => item.TaskName === taskName && item.Date === date);

  //           if (!existingTask) {
  //             this.sortedData1.push(taskObj);
  //           }
  //         }
  //       }
  //     });

  //     // Sort the array based on TaskName, Date
  //     this.sortedData1.sort((a, b) => {
  //       const taskNameComparison = a.TaskName.localeCompare(b.TaskName);
  //       return taskNameComparison === 0 ? a.Date.localeCompare(b.Date) : taskNameComparison;
  //     });

  //     console.log("sortedData1 =", this.sortedData1);
  //     this.addingSingleDDRecord();
  //   }

  // }

  //method to get single record
  // getSingleRecord(): TaskData | undefined {
  //   return this.sortedData1.length > 0 ? this.sortedData1[0] : undefined;
  // }
  addingDailyDiaryRecord(sortedData: any[]): void {
    this.isIdMatching = true;
    this.apiservice.checkRecordExists(this.stud_Id).subscribe({
      next: (res: any) => {
        console.log("response =", res);
        if (res && res.message === 'Record Does not exists for the provided Student Id.') {
          console.log('Record does not exist. Proceeding to add a new record.');
          alert("Adding New Record !!")
          this.apiservice.addDailyDiaryRecord(sortedData).subscribe({
            next: (res: any) => {
              console.log("ddRecord=", res);
              // Handle success, such as updating the UI
            },
            error: (err: any) => {
              console.error("Error:", err);
              // Handle error, such as displaying an error message to the user
            }
          });
        } else {
          console.log("Record already exists");
          alert('Record already exists for the provided Student ID.');
          // setTimeout(() => {
          //   alert('Record already exists for the provided Student ID.');
          // }, 4000); // 4000 milliseconds delay

        }
      },
      error: (err: any) => {
        console.error("Error:", err);
        // Handle error from checkRecordExists, such as displaying an error message to the user
      }
    });
  }


  //api call to service for single record
  // addingSingleDDRecord(): void {
  //     const singleRecord = this.getSingleRecord();
  //     if (singleRecord) {
  //       console.log("sendingSingleR_toAPI=", singleRecord);
  //       this.apiservice.addSingleDDRecord(singleRecord).subscribe({
  //         next: (res) => {
  //           console.log('Record sent successfully:', res);
  //           this.recordSent = true; // Mark the record as sent
  //         },
  //         error: (error) => {
  //           console.error('Error sending record:', error);
  //           // Handle error response if needed
  //         }
  //       });
  //     } else {
  //       console.error('No single record found to send.');
  //     }

  // } 
}

interface TaskData {
  Stud_Id: number;
  TaskName: string;
  Performed: string;//Performed means TaskTick
  Date: string;
  hour: string;
  Minutes?: string;

}
