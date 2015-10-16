/**
 * Define all global variables here
 */
/**
 * student_array - global array to hold student objects
 * @type {Array}
 */
var student_array=[]; // array to hold student datal
var grade_array=[]; // array to hold student grades
var i=student_array.length-1;
var globalResponse = '';
var dataInvalidTrigger= false;
var add_student_array=[];






/**
 * load_data - function that  loads data from the server via ajax calll
 * @type {Array}
 */
function load_data() //
{
    console.log ('load data called');
    $.ajax(
        {
            dataType: 'json',
            url: 'http://s-apis.learningfuze.com/sgt/get',
            type: 'GET',
            success: function(response) // api sucess handler
            {
                console.log ('loaded', response);
                student_array = response.data;
                globalResponse = response;
                list_students();
            },
            error : function(xhr, thrownError) // api failure handler
            {
                alert (xhr.status+' is the status of the alert');
                alert (thrownError+' in getting information from the server');
            },
            complete : function()   // when the call ends
            {
                console.log ('load data complete')
            }

        })
}
// stretch goals
//success - but took a while
// failure - but took too long - see server if student is there before send again
function removeInvalidInputClass() //removes the border on an input with invalid data
{
    $('.invalid_input').removeClass('invalid_input');
}
function validateInputData() //checks data for valid type
{

    removeInvalidInputClass();  // .class tag to add red border to invalid input box
    var name = $('#studentName').val();
    var grade = parseInt($('#studentGrade').val());
    var course = $('#course').val();
    var valid_data = true;
    if(name.length<2){
        $('#studentName').addClass('invalid_input');
        alert('Name must be at least 2 letters long');
        valid_data=false;
    }
    if(course.length<2){
        $('#course').addClass('invalid_input');
        alert('Course must be at least 2 letters long');
        valid_data=false;
    }
    if(isNaN(grade) || grade<0 || grade>100){
        $('#studentGrade').addClass('invalid_input');
        alert('Grade must be a number between 0 and 100');
        valid_data=false;
    }
    return valid_data;
}

function send_data(name,course,grade) // sends name,course and grade to the server and then refreshes dom with new data
{
    console.log ('send_data running');
    $.ajax({
        dataType:'json',
        data:{name:name, course:course, grade:grade},
        method:'POST',
        url:'http://s-apis.learningfuze.com/sgt/create',
        success: function(response) // if call went though
        {
            console.log ('awesome!,',add_student_array,' data sent via send_data() response=', response)
            load_data();
        },
        error : function(xhr, thrownError) // api failure handler
        {
            console.log ('error sending data with send_data()');
            alert (xhr.status+' is the status of the alert');
            alert (thrownError+' in getting information from the server');
        }
    })
}

/**
 * addStudent - creates a student objects based on input fields in the form and adds the object to global student array
 *
 * @return undefined
 */
function add_student()
{
    if (validateInputData()) //checks if data is valid
    {

        var student =
        {
            name: "",
            course: "",
            grade: ""
        };

        var name = $('#studentName').val();
        var grade = $('#studentGrade').val();
        var course = $('#course').val();
        student.name = name;
        student.grade = parseFloat(grade);
        student.course = course;
        add_student_array.push(student);
        console.log(add_student_array);
        send_data(name,course,grade);
        cancel_student();
    }
    else  // if invalid data --- with more time, add switch to alert for each type of invalid data // needswork - turn grade string into number,
    {
        alert ('invalid data detected!');
    }
}



/**
 * list_students - loops through global student array and appends each objects data into the student-list-container > list-body
 */
function list_students() { // lists students in array into document
    var list = $("#tbody");
    list.html('');            //create column header

    for (var j = 0; j < student_array.length; j++) // for loop to add student data to dom
    {
        var student = add_one_student(student_array[j]); // adds student at student_array[j] to the dom
        student.attr('student_index',student_array[j].id);
        list.append(student);
    }
    display_average_grade();
}

/**
 * add_one_student - take in a student object, create html elements from the values and then append the elements
 * into the .student_list tbody
 * @param studentObj
 */
function add_one_student(student)
{ // takes student_array[j] element as input, passed in student_array[j] from for loop

    var student_row = $("<tr>").addClass('student_row');
    var student_name = $("<td>").addClass('student_name col-xs-3').text(student.name);
    var student_course = $("<td>").addClass('student_course col-xs-3').text(student.course);
    var student_grade = $("<td>").addClass('student_grade col-xs-3').text(student.grade);
    var delete_button_td = $("<td>").addClass('delete_col col-xs-3');
    var delete_button = $('<button>').attr('type','button').addClass('btn btn-danger delBtn').text('Delete');

    delete_button.click(function()
    {
        //console.log ('testing delete button',this);
        removeStudent(this);
    });

    delete_button_td.append(delete_button);
    // delete // add a modal asking if sure, then click on button there, have button there call delete2, which sends message to server

    student_row.append(student_name, student_course, student_grade,delete_button_td);
    return student_row;
}

/**
 * calculate_average_grade - loop through the global student array and calculate average grade and return that value
 * @returns {number}
 */
function calculate_average_grade() // calculates average grade based on ALL grades, and displays result

{
    var average=0;
    var sum=0;
    for (i=0; i < student_array.length; i++)
    {
        sum = sum + parseFloat(student_array[i].grade);
    }
    avgerage = (sum / student_array.length);
    average= avgerage.toFixed(2);
    return average;
}
function display_average_grade(){ // calls calculate average grade and then displays average grade
    var average_grade = calculate_average_grade();
    $('.avgGrade').text(average_grade);
}

/**
 * cancel_student - clears out the form values based on inputIds variable
 */

function cancel_student(){ // will clear the input boxes' values
    console.log ('cancel student function running');
    removeInvalidInputClass();
    $('.form-control').val('');
}

/**
 * reset_student - resets the application to initial state. Global variables reset, DOM get reset to initial load state
 */
function reset_student(){ // clears all newly imputed data, and loads existing data from the database
    removeInvalidInputClass();
    student_array=[];
    location.reload();
    list_students();
}

function removeStudent(targetElement) // runs on clicking delete button on student row
{
    var studentRow = $(targetElement).parents('.student_row');
    //console.log ('removeStudent called, target element=',targetElement);
    var row_delete = studentRow.attr('student_index');


    //console.log (student_array,'is student array');

    $.ajax({
        dataType: 'json',
        data: {student_id: row_delete},  // 'force-failure':'server'
        method: 'POST',
        url: 'http://s-apis.learningfuze.com/sgt/delete',
        success: function (response) // if call went though
        {
            console.log('awesome!, data sent via send_data() response=', response);

            console.log(row_delete, 'delete success! via remove student function');
            delete student_array[row_delete]; // removes student from array
            if (response.success == true) // checks to see that server data is true before removing row from dom
            {
                //delete student_array[row_delete]; // removes student from array,
                console.log (studentRow, 'is student row');
                studentRow.remove();
            }
            else{ console.log ('success not true')}
            //load_data(); // for testing
        },
        error: function (xhr, thrownError) // api failure handler
        {

            alert(xhr.status + ' is the status of the alert');
            alert(thrownError + ' in getting information from the server');
            console.log(response,'error sending data with send_data()');
            return response;



        }
    });

}
function server_data_refresh() // queries the server periodically for new student data
{

    console.log ('server_data_refresh');
    setInterval(function()
    {
        console.log ('server_data_refresh in timeout');
        load_data();
    }, 200000);

}



/**
 * Listen for the document to load and reset the data to the initial state
 */

$(document).ready(function()
{
    load_data();

    /**
     * addClicked - Event Handler when user clicks the add button
     */
    $("#add").click(function () {
        add_student();
        console.log("add button clicked");
    });

    /**
     * cancelClicked - Event Handler when user clicks the cancel button, should clear out student form
     */
    $("#cancel").click(function() { // click handler for cancel button- clears input boxes
        cancel_student();
        console.log("cancel button clicked");
    });

    $("#reset").click(function()
    {
        reset_student();
        console.log("reset button clicked")
    });
    server_data_refresh();
});























