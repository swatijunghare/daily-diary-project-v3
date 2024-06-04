    using System.ComponentModel.DataAnnotations;

    namespace Student_Task_Tracker.DTOs
    {
        public class DailyDiaryDTO
        {
            [Required] public int Stud_Id { get; set; }

            [Required] public string? TaskName { get; set; }

            [Required] public string? Performed { get; set; }

            [Required] public string? Date { get; set; }

            [Required] public string? Hour { get; set; }

            public string? Minutes { get; set; }
        }
    }
