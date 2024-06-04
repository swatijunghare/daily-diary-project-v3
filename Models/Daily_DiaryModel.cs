using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Student_Task_Tracker
{
    public class DailyDiaryModel
    { 
        // public DailyDiaryModel()
        // {
        //     // Initialize Student property in the constructor
        //     Student = new StudentModel();
        // }

        [Key]
        public int Id_Daily_Diary { get; set; }

        // Foreign key
        [ForeignKey("Student")]
        public int Stud_Id { get; set; }

        public StudentModel? Student { get; set; }

        public string? TaskName { get; set; }
        public string? Performed { get; set; }
        public string? Date { get; set; }
        public string? Hour { get; set; }
        public string? Minutes { get; set; }
    }
}
