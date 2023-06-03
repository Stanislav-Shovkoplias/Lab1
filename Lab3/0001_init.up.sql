create database if not exists Notes;
use Notes;

create table if not exists Users (
    ID int not null auto_increment,
    Name varchar(50) not null,
    primary key(ID)
);

create table if not exists Note (
    ID int not null auto_increment,
    Title varchar(300),
    Content varchar(2048),
    UserID int not null,
    primary key(ID),
    foreign key(UserID) references Users(ID) on delete cascade
);

create table if not exists Link (
    ID int not null auto_increment,
    NoteID int not null,
    primary key(ID),
    foreign key(NoteID) references Note(ID) on delete cascade
);

create table if not exists Tag (
    ID int not null auto_increment,
    Name varchar(50) not null,
    primary key(ID)
);

lock tables Tag write;
insert into Tag values(1, "General");
unlock tables;

create table if not exists TagNote (
    TagID int not null default 1,
    NoteID int not null,
    unique(TagID, NoteID),
    foreign key(TagID) references Tag(ID) on delete set default,
    foreign key(NoteID) references Note(ID) on delete cascade
);