const inquirer = require('inquirer');
const mysql = require('mysql');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'business_db'
});

const menu = [
  {
    type: 'list',
    name: 'menu',
    message: 'What would you like to do?',
    choices: [
      'View all departments',
      'View all roles',
      'View all employees',
      'Add a department',
      'Add a role',
      'Add an employee',
      'Update an employee role',
      'Exit'
    ]
  }
];

const addDepartment = [
  {
    type: 'input',
    name: 'departmentName',
    message: 'Enter the name of the department:'
  }
];

function start() {
  inquirer.prompt(menu).then(response => {
    switch (response.menu) {
      case 'View all departments':
        viewDepartments();
        break;
      case 'View all roles':
        viewRoles();
        break;
      case 'View all employees':
        viewEmployees();
        break;
      case 'Add a department':
        addNewDepartment();
        break;
      case 'Add a role':
        addNewRole();
        break;
      case 'Add an employee':
        addNewEmployee();
        break;
      case 'Update an employee role':
        updateEmployeeRole();
        break;
      case 'Exit':
        console.log('Goodbye!');
        connection.end();
        break;
      default:
        console.log('Invalid input');
        start();
    }
  });
}

function viewDepartments() {
  connection.query('SELECT * FROM department', (err, res) => {
    if (err) throw err;
    console.table(res);
    start();
  });
}

function viewRoles() {
  connection.query(
    `SELECT role.id, role.title, department.name AS department, role.salary
    FROM role
    JOIN department ON role.department_id = department.id`,
    (err, res) => {
      if (err) throw err;
      console.table(res);
      start();
    }
  );
}

function viewEmployees() {
  connection.query(
    `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    LEFT JOIN employee manager ON employee.manager_id = manager.id`,
    (err, res) => {
      if (err) throw err;
      console.table(res);
      start();
    }
  );
}

function addNewDepartment() {
  inquirer
    .prompt(addDepartment)
    .then(response => {
      connection.query(
        'INSERT INTO department SET ?',
        { name: response.departmentName },
        (err, res) => {
          if (err) throw err;
          console.log('Department added successfully!');
          start();
        }
      );
    });
}


  function addNewRole() {
    connection.query('SELECT * FROM department', (err, departments) => {
      if (err) throw err;
  
      inquirer.prompt([
        {
          type: 'input',
          name: 'title',
          message: 'Enter the title of the new role:'
        },
        {
          type: 'input',
          name: 'salary',
          message: 'Enter the salary of the new role:'
        },
        {
          type: 'list',
          name: 'department',
          message: 'Select the department of the new role:',
          choices: departments.map(department => ({
            name: department.name,
            value: department.id
          }))
        }
      ]).then(response => {
        connection.query(
          'INSERT INTO role SET ?',
          {
            title: response.title,
            salary: response.salary,
            department_id: response.department
          },
          (err, res) => {
            if (err) throw err;
            console.log('Role added successfully!');
            start();
          }
        );
      });
    });
  }
  