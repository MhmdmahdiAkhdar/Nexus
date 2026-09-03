CREATE TABLE `Roles` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `Name` VARCHAR(255),
  `Description` VARCHAR(255),
  `IsSystemRole` BOOLEAN,
  `CreatedAt` DATETIME
);

CREATE TABLE `Permissions` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `Code` VARCHAR(255),
  `Description` VARCHAR(255)
);

CREATE TABLE `RolePermissions` (
  `RoleId` INT,
  `PermissionId` INT,
  PRIMARY KEY (`RoleId`, `PermissionId`)
);

CREATE TABLE `Users` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `Email` VARCHAR(255) UNIQUE,
  `PasswordHash` VARCHAR(255),
  `FullName` VARCHAR(255),
  `RoleId` INT,
  `IsActive` BOOLEAN,
  `CreatedAt` DATETIME,
  `UpdatedAt` DATETIME
);

CREATE TABLE `Products` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `Name` VARCHAR(255),
  `Description` TEXT,
  `BusinessPurpose` TEXT,
  `LifecycleStatus` VARCHAR(255),
  `CurrentVersion` VARCHAR(255),
  `SupportedMarkets` VARCHAR(255),
  `Criticality` VARCHAR(255),
  `Technologies` VARCHAR(255),
  `CreatedBy` INT,
  `UpdatedBy` INT,
  `CreatedAt` DATETIME,
  `UpdatedAt` DATETIME
);

CREATE TABLE `Modules` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `ProductId` INT,
  `Name` VARCHAR(255),
  `Description` TEXT,
  `Status` VARCHAR(255),
  `CreatedBy` INT,
  `UpdatedBy` INT,
  `CreatedAt` DATETIME,
  `UpdatedAt` DATETIME
);

CREATE TABLE `Repositories` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `ProductId` INT,
  `Name` VARCHAR(255),
  `GitHubUrl` VARCHAR(255) UNIQUE,
  `MainBranch` VARCHAR(255),
  `CreatedBy` INT,
  `CreatedAt` DATETIME
);

CREATE TABLE `RepositoryUpdates` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `RepositoryId` INT,
  `Title` VARCHAR(255),
  `Description` TEXT,
  `CommitReference` VARCHAR(255),
  `UpdatedBy` INT,
  `UpdateDate` DATE,
  `CreatedAt` DATETIME
);

CREATE TABLE `Documents` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `ProductId` INT,
  `Name` VARCHAR(255),
  `DocumentType` VARCHAR(255),
  `UrlReference` VARCHAR(255),
  `LastUpdatedDate` DATE,
  `CreatedBy` INT,
  `UpdatedBy` INT,
  `CreatedAt` DATETIME
);

CREATE TABLE `Clients` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `CompanyName` VARCHAR(255),
  `Country` VARCHAR(255),
  `ContactInfo` VARCHAR(255),
  `Status` VARCHAR(255),
  `CreatedBy` INT,
  `UpdatedBy` INT,
  `CreatedAt` DATETIME,
  `UpdatedAt` DATETIME
);

CREATE TABLE `Deployments` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `ClientId` INT,
  `ProductId` INT,
  `ProductVersion` VARCHAR(255),
  `GoLiveDate` DATE,
  `DeploymentStatus` VARCHAR(255),
  `SupportTier` VARCHAR(255),
  `CreatedBy` INT,
  `UpdatedBy` INT,
  `CreatedAt` DATETIME,
  `UpdatedAt` DATETIME
);

CREATE TABLE `DeploymentModules` (
  `DeploymentId` INT,
  `ModuleId` INT,
  PRIMARY KEY (`DeploymentId`, `ModuleId`)
);

CREATE TABLE `Environments` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `DeploymentId` INT,
  `EnvironmentName` VARCHAR(255),
  `EnvironmentType` VARCHAR(255),
  `ServerName` VARCHAR(255),
  `ApplicationUrl` VARCHAR(255),
  `AccessReference` VARCHAR(255),
  `CreatedBy` INT,
  `UpdatedBy` INT,
  `CreatedAt` DATETIME,
  `UpdatedAt` DATETIME
);

CREATE TABLE `TeamMembers` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `FullName` VARCHAR(255),
  `JobTitle` VARCHAR(255),
  `Department` VARCHAR(255),
  `Email` VARCHAR(255),
  `Status` VARCHAR(255),
  `CreatedBy` INT,
  `UpdatedBy` INT,
  `CreatedAt` DATETIME,
  `UpdatedAt` DATETIME
);

CREATE TABLE `ProductResponsibilities` (
  `Id` INT PRIMARY KEY AUTO_INCREMENT,
  `ProductId` INT,
  `TeamMemberId` INT,
  `Responsibility` VARCHAR(255),
  `Description` VARCHAR(255),
  `CreatedBy` INT,
  `CreatedAt` DATETIME
);

ALTER TABLE `RolePermissions` ADD FOREIGN KEY (`RoleId`) REFERENCES `Roles` (`Id`);
ALTER TABLE `RolePermissions` ADD FOREIGN KEY (`PermissionId`) REFERENCES `Permissions` (`Id`);
ALTER TABLE `Users` ADD FOREIGN KEY (`RoleId`) REFERENCES `Roles` (`Id`);
ALTER TABLE `Products` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `Users` (`Id`);
ALTER TABLE `Products` ADD FOREIGN KEY (`UpdatedBy`) REFERENCES `Users` (`Id`);
ALTER TABLE `Modules` ADD FOREIGN KEY (`ProductId`) REFERENCES `Products` (`Id`);
ALTER TABLE `Modules` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `Users` (`Id`);
ALTER TABLE `Modules` ADD FOREIGN KEY (`UpdatedBy`) REFERENCES `Users` (`Id`);
ALTER TABLE `Repositories` ADD FOREIGN KEY (`ProductId`) REFERENCES `Products` (`Id`);
ALTER TABLE `Repositories` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `Users` (`Id`);
ALTER TABLE `RepositoryUpdates` ADD FOREIGN KEY (`RepositoryId`) REFERENCES `Repositories` (`Id`);
ALTER TABLE `RepositoryUpdates` ADD FOREIGN KEY (`UpdatedBy`) REFERENCES `TeamMembers` (`Id`);
ALTER TABLE `Documents` ADD FOREIGN KEY (`ProductId`) REFERENCES `Products` (`Id`);
ALTER TABLE `Documents` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `Users` (`Id`);
ALTER TABLE `Documents` ADD FOREIGN KEY (`UpdatedBy`) REFERENCES `Users` (`Id`);
ALTER TABLE `Clients` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `Users` (`Id`);
ALTER TABLE `Clients` ADD FOREIGN KEY (`UpdatedBy`) REFERENCES `Users` (`Id`);
ALTER TABLE `Deployments` ADD FOREIGN KEY (`ClientId`) REFERENCES `Clients` (`Id`);
ALTER TABLE `Deployments` ADD FOREIGN KEY (`ProductId`) REFERENCES `Products` (`Id`);
ALTER TABLE `Deployments` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `Users` (`Id`);
ALTER TABLE `Deployments` ADD FOREIGN KEY (`UpdatedBy`) REFERENCES `Users` (`Id`);
ALTER TABLE `DeploymentModules` ADD FOREIGN KEY (`DeploymentId`) REFERENCES `Deployments` (`Id`);
ALTER TABLE `DeploymentModules` ADD FOREIGN KEY (`ModuleId`) REFERENCES `Modules` (`Id`);
ALTER TABLE `Environments` ADD FOREIGN KEY (`DeploymentId`) REFERENCES `Deployments` (`Id`);
ALTER TABLE `Environments` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `Users` (`Id`);
ALTER TABLE `Environments` ADD FOREIGN KEY (`UpdatedBy`) REFERENCES `Users` (`Id`);
ALTER TABLE `TeamMembers` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `Users` (`Id`);
ALTER TABLE `TeamMembers` ADD FOREIGN KEY (`UpdatedBy`) REFERENCES `Users` (`Id`);
ALTER TABLE `ProductResponsibilities` ADD FOREIGN KEY (`ProductId`) REFERENCES `Products` (`Id`);
ALTER TABLE `ProductResponsibilities` ADD FOREIGN KEY (`TeamMemberId`) REFERENCES `TeamMembers` (`Id`);
ALTER TABLE `ProductResponsibilities` ADD FOREIGN KEY (`CreatedBy`) REFERENCES `Users` (`Id`);

ALTER TABLE `Users` ADD COLUMN `MustChangePassword` BOOLEAN NOT NULL DEFAULT TRUE;
