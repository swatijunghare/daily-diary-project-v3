using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.EntityFrameworkCore;
using Student_Task_Tracker.Data;
using Student_Task_Tracker.DTOs;

namespace Student_Task_Tracker.Controllers;

[ApiController]
[Route("[controller]")]

public class StudentController : ControllerBase
{
    private readonly StudentDbContext _context;

    public StudentController(StudentDbContext studentDbContext)
    {
        _context = studentDbContext;
    }

    [HttpPost("add_student")]
    public IActionResult AddStudent([FromBody] StudentModel studentObj)
    {
        if (studentObj == null)
        {
            return BadRequest();
        }
        else
        {
            _context.studentModels.Add(studentObj);
            _context.SaveChanges();
            return Ok(new
            {
                StatusCodes = 200,
                Message = "Student Added Successfully"
            });
        }
    }
    [HttpGet("get_all_student")]
    public IActionResult GetAllStudents()
    {
        var students = _context.studentModels.AsQueryable();
        return Ok(new
        {
            StatusCode = 200,
            StudentDetails = students
        });
    }

    [HttpGet("get_student/{id}")]
    public IActionResult GetStudent(int id)
    {
        var student = _context.studentModels.Find(id);
        if (student == null)
        {
            return NotFound(new
            {
                StatusCode = 404,
                Message = "Student Not Found"
            });
        }
        else
        {
            return Ok(new
            {
                StatusCode = 200,
                StudentDetails = student
            });
        }

    }

    [HttpPost("add_daily_diary_record")]
    public async Task<IActionResult> AddDailyDiaryRecord([FromBody] List<DailyDiaryDTO> dailyDiaryRecords)
    {
        try
        {
            if (dailyDiaryRecords == null || dailyDiaryRecords.Count == 0)
            {
                Console.WriteLine("Invalid data. No records provided.");
                return BadRequest(new
                {
                    StatusCode = 400,
                    Message = "Invalid data. No records provided."
                });
            }

            foreach (var dto in dailyDiaryRecords)
            {
                var record = new DailyDiaryModel
                {
                    Stud_Id = dto.Stud_Id, // Attach the student ID to each record
                    TaskName = dto.TaskName,
                    Performed = dto.Performed,
                    Date = dto.Date,
                    Hour = dto.Hour,
                    Minutes = dto.Minutes
                };

                // Additional validation logic if needed

                _context.dailyDiaryModels.Add(record);
            }
            await _context.SaveChangesAsync();

            return StatusCode(201, new
            {
                StatusCode = 201,
                Message = "Records added successfully."
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"An error occurred while processing the request. Error: {ex.Message}");
            return StatusCode(500, new
            {
                StatusCode = 500,
                Message = "An error occurred while processing the request.",
                Error = ex.Message
            });
        }
    }

    [HttpPost("add_Single_DDRecord")]
    public async Task<IActionResult> AddSingleDDRecord([FromBody] DailyDiaryDTO dailyDiaryRecord)
    {
        try
        {
            //Console.WriteLine("heloo");

            if (dailyDiaryRecord == null)
            {
                Console.WriteLine("Invalid data. No record provided.");
                return BadRequest(new
                {
                    StatusCode = 400,
                    Message = "Invalid data. No record provided."
                });
            }

            var record = new DailyDiaryModel
            {
                Stud_Id = dailyDiaryRecord.Stud_Id, // Extract the student ID from the DTO
                TaskName = dailyDiaryRecord.TaskName,
                Performed = dailyDiaryRecord.Performed,
                Date = dailyDiaryRecord.Date,
                Hour = dailyDiaryRecord.Hour,
                Minutes = dailyDiaryRecord.Minutes
            };

            // Additional validation logic if needed

            _context.dailyDiaryModels.Add(record);
            await _context.SaveChangesAsync();

            return StatusCode(201, new
            {
                StatusCode = 201,
                Message = "Record added successfully."
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"An error occurred while processing the request. Error: {ex.Message}");
            return StatusCode(500, new
            {
                StatusCode = 500,
                Message = "An error occurred while processing the request.",
                Error = ex.Message
            });
        }
    }

    [HttpPost("check_record_exists")]
    public IActionResult CheckRecordExists([FromBody] int stud_Id)
    {
        Console.WriteLine("backend_ id=", stud_Id);
        try
        {
            var existingRecord = _context.dailyDiaryModels.FirstOrDefault(d => d.Stud_Id == stud_Id);
            //Console.WriteLine("id from table =",Stud_Id)
            if (existingRecord != null)
            {
                return Ok(new
                {
                    // StatusCode = 200,
                    Exists = true,
                    Message = "Record Already Exists."
                });
            }

            else
            {
                return Ok(new
                {
                    //StatusCode = 200,
                    Exists = false,
                    Message = "Record Does not exists for the provided Student Id."
                });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"An error occurred while processing the request. Error: {ex.Message}");
            return StatusCode(500, new
            {
                StatusCode = 500,
                Message = "An error occurred while processing the request.",
                Error = ex.Message
            });
        }
    }



}
