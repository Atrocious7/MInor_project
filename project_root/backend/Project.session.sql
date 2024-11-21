create DATABASE Minor;
use Minor;
CREATE TABLE `users` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `username` varchar(255) NOT NULL,
    `password` varchar(255) NOT NULL,
    PRIMARY KEY (`id`)
)


CREATE TABLE quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    num_questions INT NOT NULL
);


CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quiz_id INT,
    question_text TEXT NOT NULL,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_option CHAR(1),  -- Correct answer (A, B, C, or D)
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option)
VALUES 
    (1, 'What is the capital of France?', 'Paris', 'London', 'Berlin', 'Madrid', 'A'),
    (1, 'What is 2 + 2?', '3', '4', '5', '6', 'B'),
    (1, 'What is the largest planet?', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'C'),
    (1, 'What is the chemical symbol for water?', 'H2O', 'O2', 'CO2', 'NaCl', 'A');
    (1,'What is the chemical symbol for carbon?', 'C', 'H', 'O', 'N', 'D');
    (1, 'Who is the author of "To Kill a Mockingbird"?', 'Harper Lee', 'Harriet Tubman', 'Harriet Lee & John Stein
    ', 'Agatha Christie', 'B'),



SELECT * from questions;



ALTER TABLE quizzes DROP COLUMN pathway_id;

