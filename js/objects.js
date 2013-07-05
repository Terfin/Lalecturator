var examId = 0;
var ev;
var elem;

var User = function(/*args*/)
{
	var self = this;
	self.username = ko.observable(arguments[0]);
	self.password = ko.observable(arguments[1]);
}




var Student = function(/*args*/) {
	var self = this;
	self.uid = ko.observable(arguments[0]);
	self.email = ko.observable(arguments[3]);
    self.exams = ko.observableArray([]);
	User.call(this, arguments[1], arguments[2]);

    self.addExam = function (exam) {
        if (exam instanceof Exam && !(exam in self.exams()))
        {
            self.exams.push(exam);
        }
    }
}

var Lecturer = function(username, password) {
	User.call(this, username, password);
}

var Exam = function(data) {
	var self = this;
    if (data == undefined || data == null) {
        self.name = ko.observable("Exam Title");
        self.id = ko.observable(++examId);
        self.questions = ko.observableArray([]);
        self.QuestionPages = ko.computed(function () {
            var questionNumber = self.questions().length;
            return (Math.floor(((questionNumber - 1) * 1.0 / 3) + 1));
        });
        self.currentPage = ko.observable(0);
        self.questionsInPage = ko.computed(function ()
        {
            return self.questions().slice((self.currentPage()) * 3, (self.currentPage() + 1) * 3);
        });
        self.selectExam = function (element) {
            if (vm.evm.selectedExam() != element)
            {
                vm.evm.selectedExam(element);
                for (var i = 0; i < element.questions().length; i++)
                {
                    element.questions()[i].answers.valueHasMutated();
                }
            }
        }
        self.score = ko.observable();
        self.addQuestion = function () {
            self.questions.push(new Question(null, self.id, self.questions().length + 1));
        }

        self.averageScore = ko.computed(function () {
            var average = 0.0;
            if  (vm != undefined)
            {
                for (student in vm.svm.Students())
                {
                    if  (student.exams != undefined)
                    {
                        exam = student.exams.filter(function (elem)
                        {
                            return elem.id() == vm.evm.selectedExam().id();
                        });
                        average += exam.score();
                    }
                }
                return average;
            }
            return 0.0;
        });

        self.createStudentExam = function () {
            var exam =  new Exam();
            exam.id(self.id());
            exam.name(self.name());
            exam.questions = self.questions();
            return exam;

        }

        self.nextPage = function ()
        {
            self.currentPage(self.currentPage() + 1);
        }

        self.prevPage = function ()
        {
            self.currentPage(self.currentPage() - 1);
        }
    }
    else {
        ko.mapping.fromJS(data, {}, self);
    }
}

var Question = function(data, examId, qid) {
	var self = this;
    self.answers = ko.observableArray();

    self.id = ko.observable(qid);
    self.text = ko.observable('Question Text');
    self.examId = examId;
    self.currentAnswer = ko.observable();
    self.currentUserAnswer = ko.computed(function ()
    {
        var answers = self.answers();
        var userAnswer = answers.filter(function (answer) {
            if (loggedUser != null && loggedUser instanceof Student)
            {
            return answer.userId() == loggedUser.uid();
            }
            else {
                return false;
            }
        });
        if (userAnswer.length > 0)
        {
            return userAnswer[0].content();
        }
        else
        {
            return null;
        }
    });
    self.currentUserAnswer.subscribe(function ()
    {
        self.currentAnswer(self.currentUserAnswer());
    });
    self.SaveAnswer = function ()
    {
        var answer = self.answers().filter(function (answer)
        {
            return answer.userId() == loggedUser.uid();
        });
        if (answer.length == 0)
        {
            self.answers.push(new Answer(self.answers().length, self.currentAnswer(), loggedUser.uid()));
        }
        else
        {
            answer[0].content(self.currentAnswer());
            self.answers.valueHasMutated();
        }
        lscache.set('exams', ko.mapping.toJS(vm.evm.exams()));
    }
}

var Answer = function(id, content, userId)
{
    var self = this;
    self.id = ko.observable(id);
    self.content = ko.observable(content);
    self.userId = ko.observable(userId);
}
var viewModel = function() {
	var self = this;
	self.Users = ko.observableArray([]);
	self.Lecturers = ko.computed(function () {
		return ko.utils.arrayFilter(self.Users(), function(item) {
			return item instanceof Lecturer;
		});
	});
	self.loggedUser = ko.observable();
	self.loginObj = ko.observable();
	self.svm = new studentViewModel(self);
	self.evm = new examViewModel(self);
	self.resetLS = function () {
		user = lscache.get('loggedUser');
		if (user != null)
		{
			lscache.set('loggedUser', user, 15);
		}
	}
	
	self.editElement = function (element) {
		$(element).hide();
		$(element).next().show();
	}

	self.editDone = function (element, event) {
		if (event.type == 'blur' || event.keyCode == 13 || event.keyCode == 27) 
		{
			$(element).hide();
			$(element).prev().show();
            lscache.set('exams', ko.mapping.toJS(vm.evm.exams(), { 'ignore' : ['currentUserAnswer']}));
		}
	}
}

var studentViewModel = function(mainVM) {
	var self = this;
	self.currentPage = ko.observable(0);
	self.numPages = ko.observable(0);
	self.studentsByPage = ko.observableArray();
	self.selectedStudent = ko.observable();
    self.selectedStudentKO = ko.observable();
	self.studentFormObj = ko.observable();
	self.Students = ko.computed(function () {
		return ko.utils.arrayFilter(mainVM.Users(), function(item) {
			return item instanceof Student;
		});
	});
	self.Students.subscribe(function () {
		self.syncUserPage();
	});
	self.addStudent = function () {
		mainVM.resetLS();
		var valid = true;
		$('form.addStudent input[type=text]').each(function () {
			if (this.value == '')
			{
				$(this).css("border", "2px solid #FF0000");
				valid = false;
			}
			else if (this.id == "idNum" && isNaN(this.value) || !self.notStudent(parseInt(this.value, 10))) {
				$(this).css("border", "2px solid #FF0000");
				valid = false;
			}
			else if (this.id == "email" && (this.value.match(/@/g) == null || this.value.match(/@/g).length != 1)) {
				$(this).css("border", "2px solid #FF0000");
				valid = false;
			}
			else {
				$(this).css("border", "");
			}
		});
		if (valid) {
			mainVM.Users.push(self.studentFormObj());
			self.syncUserPage();
			self.studentFormObj(new Student());
			lscache.set('students', ko.mapping.toJS(self.Students));
		}
	}

	self.syncUserPage = function () {
		var studLen = self.Students().length;
        self.numPages(Math.floor(((studLen - 1) * 1.0) / 10) + 1);
		if ((studLen / 10) != Math.floor(studLen / 10)) {
			self.currentPage(Math.floor((studLen / 10) + 1));
		}
        else
        {
            self.currentPage(Math.floor((studLen / 10)));
        }
		self.studentsByPage(self.Students().slice((self.currentPage() - 1) * 10));

	}

	self.saveStudent = function () {
		mainVM.resetLS();
		var user = self.studentFormObj().original;
		user.uid(self.studentFormObj().uid);
		user.username(self.studentFormObj().username);
		user.email(self.studentFormObj().email);
		user.password(self.studentFormObj().password);
		self.studentFormObj(new Student());
		self.syncUserPage();
		$('#addStud').show();
		$('#saveStud').hide();
		lscache.set('students', ko.mapping.toJS(self.Students()));
	}

	

	self.editStudent = function () {
		if (self.selectedStudentKO() != undefined) {
            var student = self.selectedStudentKO();
		self.studentFormObj({
			original: student,
			username: student.username(),
			uid: student.uid(),
			email: student.email(),
			password: student.password()
		});
		$('#addStud').hide();
		$('#saveStud').show();
		}
	}

	self.removeStudent = function () {
		if (self.selectedStudentKO() != undefined) {
		    var student = self.selectedStudentKO();
		mainVM.Users().splice(mainVM.Users().indexOf(student), 1);
		var lect = mainVM.Users().splice(mainVM.Users().indexOf(function () {
			return mainVM.Users().filter(function (element) {
				return element instanceof Lecturer;
			})[0]}));	
		mainVM.Users.push(lect[0]);
		self.studentFormObj(new Student());
        self.selectedStudentKO(null);
		self.syncUserPage();
		$('#addStud').show();
		$('#saveStud').hide();
		}
		lscache.set('students', ko.mapping.toJS(self.Students()));
	}

	self.nextPage = function () {
		self.currentPage(self.currentPage() + 1);
		self.studentsByPage(self.Students().slice((self.currentPage() - 1) * 10, self.currentPage() * 10));
	}

	self.prevPage = function () {
		self.currentPage(self.currentPage() - 1);
		self.studentsByPage(self.Students().slice((self.currentPage() - 1) * 10, self.currentPage() * 10));
	}

	self.notStudent = function (studId) {
		var student = self.Students().filter(function (elem) {
			return elem.uid() == studId;
		});
		return (student.length == 0);
	}
	self.selectStudent = function(student, evt) {
		if (self.selectedStudent() != evt.currentTarget)
		{
			$(self.selectedStudent()).removeClass("listClick");
			$(evt.currentTarget).addClass("listClick");
			self.selectedStudent(evt.currentTarget);
            self.selectedStudentKO(student);
		}
	}


}

var examViewModel = function (MainVM) {
	var self = this;
	self.exams = ko.observableArray();
	var cacheExams = lscache.get('exams');

    var mapping =  {
        'questions': {
            create: function(options) {
                var question = ko.mapping.fromJS(options.data, {
                    'answers': {
                        create: function (options) {
                            return ko.mapping.fromJS(options.data, {}, new Answer);
                        }
                    }
                }, new Question);
                question.answers.valueHasMutated();
                return question;
            }
        }
    }
	for (exIdx in cacheExams)
	{
		self.exams.push(ko.mapping.fromJS(cacheExams[exIdx], mapping, new Exam));

	}
	self.selectedExam = ko.observable();
	self.newExamSelection = ko.observable();
	if (self.exams().length > 0)
	{
		self.newExamSelection(1);
		self.selectedExam(self.exams[0]);

	}

	
	self.newExam = function () {
		var exam = new Exam();
		self.selectedExam(exam);
		self.exams.push(exam);
		lscache.set('exams', ko.mapping.toJS(self.exams()));
	}
	self.loadExam = function (element) {
		var exId = parseInt($(element).val(), 10);
		var exam = self.exams().filter(function (exam) {
			return (exam.id() == exId);
		});
		self.selectedExam(exam[0]);
	}
	self.newQuestion = function () {
		self.selectedExam().addQuestion();
		lscache.set('exams', ko.mapping.toJS(self.exams()));
	}
	self.loadAnswer = function (question) {
		var currentAnswersSet = question.answers().filter(function (answer) {
			return answer.student().uid() == loggedUser.uid();
		});
        return currentAnswersSet[0];
	}
}