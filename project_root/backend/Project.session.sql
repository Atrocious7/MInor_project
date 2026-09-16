SET SESSION sql_mode = REPLACE(@@sql_mode, 'ANSI_QUOTES', '');

CREATE TABLE `users` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `username` varchar(255) NOT NULL,
    `password` varchar(255) NOT NULL,
    PRIMARY KEY (`id`)
);


CREATE TABLE quizzes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    num_questions INT NOT NULL
);

INSERT INTO quizzes (id, title, difficulty, num_questions) VALUES
(4, 'Aptitude and Reasoning', 'Intermediate', 8),
(5, 'Quantum Physics', 'Advanced', 8),
(6, 'Aerospace Engineering', 'Advanced', 8),
(7, 'String Theory', 'Advanced', 7),
(8, 'Pharmacology', 'Intermediate', 7);


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
    (4, "If 5 workers take 10 days to complete a task, how many days will 8 workers take to complete the same task, assuming all workers work at the same rate?", "6.25 days", "7 days", "8 days", "5 days", "A"),
(4, "What is the next term in the series: 2, 6, 12, 20, 30?", "40", "42", "45", "36", "B"),
(4, "A man walks 2 km south, then 3 km east, and finally 6 km north. How far is he from his starting point?", "3 km", "5 km", "7 km", "6 km", "B"),
(4, "If a train traveling at 60 km/h crosses a platform in 45 seconds and the platform is 400 meters long, what is the length of the train?", "200 meters", "250 meters", "300 meters", "150 meters", "C"),
(4, "Pointing to a man, a woman said, 'His mother is the only daughter of my mother.' How is the man related to the woman?", "Son", "Brother", "Grandson", "Nephew", "B"),
(4, "If the cost price of 20 articles is equal to the selling price of 16 articles, what is the profit percentage?", "15%", "20%", "25%", "30%", "C"),
(4, "What is the angle between the hour and minute hands of a clock at 3:15?", "0°", "7.5°", "22.5°", "30°", "B"),
(4, "In a certain code, 'MANGO' is written as '12345', and 'APPLE' is written as '67890'. How is 'MANGO' encoded in reverse order?", "54321", "43215", "34512", "21435", "A");


INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES
(5, "What is the principle that states you cannot simultaneously know the exact position and momentum of a particle?", "Uncertainty Principle", "Complementarity Principle", "Pauli Exclusion Principle", "Wave-Particle Duality", "A"),
(5, "Which of the following particles is its own antiparticle?", "Electron", "Proton", "Photon", "Neutron", "C"),
(5, "What is the spin quantum number of an electron in an s-orbital?", "0", "+1/2", "-1/2", "1", "B"),
(5, "Which interpretation of quantum mechanics suggests that every quantum event spawns a new universe?", "Copenhagen Interpretation", "Many-Worlds Interpretation", "Hidden Variables Theory", "Quantum Loop Gravity", "B"),
(5, "The Schrödinger equation is fundamental in quantum mechanics. What does its solution represent?", "Energy of a particle", "Probability density of a particle", "Velocity of a particle", "Momentum of a particle", "B"),
(5, "What is the term for the smallest amount of energy that can be emitted or absorbed as electromagnetic radiation?", "Photon", "Quantum", "Planck Constant", "Wavelength", "B"),
(5, "In quantum mechanics, what is 'tunneling'?", "A particle passing through a barrier it classically couldn't pass", "A particle emitting radiation at high velocity", "A particle traveling faster than light", "A particle decaying into smaller components", "A"),
(5, "Which experiment demonstrated the wave-particle duality of electrons?", "Double-Slit Experiment", "Photoelectric Effect", "Davisson-Germer Experiment", "Compton Scattering", "C");

INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES
(6, "What is the primary function of an airfoil in an aircraft?", "To reduce drag", "To provide lift", "To stabilize yaw", "To reduce turbulence", "B"),
(6, "What is the term for the speed at which the flow of air around an object becomes supersonic?", "Mach Number", "Critical Mach Number", "Reynolds Number", "Lift-to-Drag Ratio", "B"),
(6, "What is the key principle behind the working of a jet engine?", "Newton's Third Law of Motion", "Bernoulli's Principle", "Boyle's Law", "Pascal's Law", "A"),
(6, "Which component of a rocket provides stabilization during flight?", "Fins", "Nozzle", "Propellant", "Payload", "A"),
(6, "What does the term 'stall' refer to in aircraft flight?", "Engine failure", "Exceeding maximum thrust", "Loss of lift due to high angle of attack", "Structural damage", "C"),
(6, "What is the primary purpose of the vertical stabilizer on an aircraft?", "To control pitch", "To control roll", "To control yaw", "To increase thrust", "C"),
(6, "Which law governs the relationship between lift, drag, and thrust in steady flight?", "Newton's Laws of Motion", "The Lift Equation", "The Drag Equation", "The Equilibrium of Forces", "D"),
(6, "In aerospace engineering, what does 'ISP' stand for in the context of rocket engines?", "Initial Space Pressure", "Ideal Specific Power", "Specific Impulse", "Internal Static Pressure", "C");


INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES
(7, "What is the basic concept of String Theory?", "Particles are points in space", "Particles are one-dimensional strings", "Particles do not exist", "Particles are waves", "B"),
(7, "String Theory attempts to unify which two major theories of physics?", "Electromagnetism and Gravity", "Quantum Mechanics and General Relativity", "Special Relativity and Thermodynamics", "Classical Mechanics and Quantum Mechanics", "B"),
(7, "How many dimensions does String Theory propose in its most common form?", "3", "4", "10 or 11", "12", "C"),
(7, "What is the name of the strings in String Theory that have ends attached to surfaces (branes)?", "Open strings", "Closed strings", "Bound strings", "Infinite strings", "A"),
(7, "Which force is NOT explained by String Theory?", "Electromagnetic Force", "Weak Nuclear Force", "Gravitational Force", "None of the above", "D"),
(7, "Which type of string in String Theory forms loops?", "Open strings", "Closed strings", "Straight strings", "Infinite strings", "B"),
(7, "What is the name of the theory that combines String Theory with membranes?", "Quantum Loop Gravity", "M-Theory", "Supersymmetry", "Electroweak Theory", "B");


INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES
(8, "What is the study of drug absorption, distribution, metabolism, and excretion called?", "Pharmacokinetics", "Pharmacodynamics", "Pharmacology", "Toxicology", "A"),
(8, "Which class of drugs is primarily used to lower cholesterol levels in the blood?", "Beta-blockers", "Statins", "ACE inhibitors", "Diuretics", "B"),
(8, "What is the mechanism of action of nonsteroidal anti-inflammatory drugs (NSAIDs)?", "Blockade of beta receptors", "Inhibition of prostaglandin synthesis", "Inhibition of histamine release", "Stimulation of GABA receptors", "B"),
(8, "Which vitamin is essential for the synthesis of clotting factors in the liver?", "Vitamin A", "Vitamin C", "Vitamin D", "Vitamin K", "D"),
(8, "What is the preferred route of administration for drugs that undergo extensive first-pass metabolism?", "Oral", "Sublingual", "Intramuscular", "Topical", "B"),
(8, "Which of the following is classified as an antifungal drug?", "Amoxicillin", "Clarithromycin", "Fluconazole", "Ciprofloxacin", "C"),
(8, "What is the therapeutic use of beta-blockers like propranolol?", "Treatment of hypertension", "Treatment of asthma", "Management of diabetes", "Treatment of bacterial infections", "A");


CREATE TABLE quiz_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    quiz_id INT NOT NULL,
    score INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

