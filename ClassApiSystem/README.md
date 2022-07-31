### Project Members
Lance Adriano \
Satoru Yamamoto

## Entities:
### Users
```
These represent Tarpaulin application users. A User will have the attributes: name (User’s name), email (User’s email), (User’s password), and role. The ‘role’ attribute can have one of three roles: admin, instructor, and student.  Each of these roles represents a different set of permissions to perform certain API actions. For example, only an authenticated User with the 'admin' role can create users with the 'admin' or 'instructor' roles.
```

### Courses
```
These represent courses being managed in Tarpaulin.  A Course will have the attributes: subject (Subject code, e.g. CS), number (Course number, e.g. 493), title (Course title), term (Academic term), and instructorId (The instructor’s id). Each Course also has associated data of other entity types, including a list of enrolled students (i.e. Tarpaulin Users with the student role) as well as a list of assignments.
```
### Assignments
```
These represent a single assignment for a Tarpaulin Course.  Each Assignment belongs to a specific Course and will have the attributes: courseId (The id of the course it belongs to), title (The assignment’s title), points (The total amount of points the assignment is worth), and due (The assignment’s deadline in ISO 8601 format).  It also has a list of individual student submissions.
```
### Submissions
```
These represent a single student submission for an Assignment in Tarpaulin. Each submission belongs both to its Assignment to the student who submitted it and will have the attributes: assignmentId (The id of the assignment it belongs to), studentId (The id of the student it belongs to), timestamp (The date and time the Submission was made, in ISO 8601 format), grade (The grade, in points, assigned to the student for this submission, if one is assigned. Should not be accepted during submission creation, only via update), and file (The specific file the Submission is associated with, which will be uploaded to the Tarpaulin API and stored, so it can be downloaded later).
```

## Actions:
### Basic features
```
Fetching entity data and creating, modifying, and deleting entities.
```
### Course roster download
```
GET /courses/{id}/roster allows certain authorized users to download a roster for the course.
```
### Assignment submission creation
```
POST /assignments/{id}/submissions allows authorized users as student to upload a file submission for a specific assignment. When storing the submission file, our API generates the URL with which that file can later be accessed, and it will be returned along with the rest of the information about the submission from GET /assignments/{id}/submissions
```
### User data fetching
```
GET /users/{id} allows logged in users to see their own data. The data includes the list of classes the user is enrolled in or teaching.
```
### Course information fetching
```
GET /courses and GET /courses/{id}allows users to see information about courses. The data does not include about a course’s enrolled students or its Assignments. GET /courses/{id}/students and GET /courses/{id}/assignments allows users to see information about a course’s enrolled students or its Assignments
```
## Authorization:
* We implement the standard JWT based authorization scheme.
* For requests made without a valid authentication token, our API permits 10 requests/minutes.
* For requests made with a valid authentication token, our API permits 30 requests/minutes.

## Services:
* We haven’t finalized which service(s) we will use in the final project yet.
* For now, we are planning on using MongoDB and Redis to power our API.
