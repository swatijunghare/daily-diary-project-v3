import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  stud_Id !: number;

  public loginAPIUrl: string = "https://localhost:7158/Login/";
  public studentAPIUrl: string = "https://localhost:7158/Student/";
  private apiUrl = 'https://ai.smartpaperapi.com/scan/form/image';
  private apiKey = '10b3213a34ef-46b5-829e-56768d30a6fb';

  constructor(private http: HttpClient) { }

  getStudents() {
    return this.http.get<any>(`${this.studentAPIUrl}get_all_student`)
      .pipe(map((res: any) => {
        return res;
      }))
  }
  getStudentById(id: number) {
    return this.http.get<any>(`${this.studentAPIUrl}get_student/${id}`)
      .pipe(map((res: any) => {
        return res;
      }))
  }
  login(vtObj: any) {
    return this.http.post<any>(`${this.loginAPIUrl}login`, vtObj);
  }

  addDailyDiaryRecord(recordArray: any[]): Observable<any> {
    return this.http.post<any>(`${this.studentAPIUrl}add_daily_diary_record`, recordArray)
     .pipe(map ((res:any)=>{
      console.log("res =",res);
      return res;
     })) 
  }

  checkRecordExists(studId : number):Observable<any> {
   // const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    //return this.http.post<any>(`${this.studentAPIUrl}check_record_exists`, studId, { headers: headers });
    return this.http.post<any>(`${this.studentAPIUrl}check_record_exists`, studId);
  }
  // addDailyDiaryRecord(studId: number,sortedData: any[]): Observable<any> {
  //  const recordArrayWithStudId = sortedData.map(record => ({ ...record, Stud_Id: studId }));
  //   console.log(studId);
  
  //   // Add Stud_Id to each record
  //  // const recordArrayWithStudId = sortedData.map(record => ({ ...record, Stud_Id: stud_Id }));
  
  //   return this.http.post<any>(`${this.studentAPIUrl}add_daily_diary_record/${studId}`, recordArrayWithStudId);
  //     // .pipe(map((res: any) => {
  //     //   console.log("res =", res);
  //     //   return res;
  //     // }));
  // }
  
  // addSingleDDRecord(record: any) : Observable<any> {
  //   console.log("single_record==",record);
  //   return this.http.post<any>(`${this.studentAPIUrl}add_Single_DDRecord`,record).pipe(
  //     catchError(error =>{
  //       console.error('Error sending record:', error);
  //       throw error; 
  //     })
  //   );
  // }
  uploadCompressedImg(compressedBase64: string): Observable<any> {
    // Convert the base64 string back to a Uint8Array
    const byteCharacters = atob(compressedBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    const formData = new FormData();
    const formName = 'api_form_v2';
    const formImage = new Blob([byteArray], { type: 'image/jpeg' });


    formData.append('formName', formName);
    formData.append('formImage', formImage, 'compressed_image.jpg');
    formData.append('metadata', '{}');
    formData.append('realTimeRespType', 'simpleKeyValue');

    //console.log('Before sendData:', compressedBase64);
    return this.http.post(this.apiUrl, formData, {
      headers: {
        'x-api-key': this.apiKey,
      },
    });
  }

}
