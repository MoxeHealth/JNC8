-- Create the Encounters table
IF NOT EXISTS (SELECT * FROM sys.objects
	WHERE object_id = OBJECT_ID(N'[dbo].[Encounters]')
	AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[Encounters] (
	[id] [int](10) NOT NULL IDENTITY,
	[pt_id] [nvarchar] (50) NOT NULL,
	[org_id] [nvarchar] (50) NULL,
	[emails] [nvarchar] (200) NULL,
	[encounter_date] [datetime] NOT NULL,
	[blood_pressure] [nvarchar] (200) NULL,
	[target_bp] [nvarchar] (200) NULL,
	[prescribed_meds] [nvarchar] (1000) NULL,
	[removed_meds] [nvarchar] (1000) NULL,
	[current_meds] [nvarchar] (1000) NULL,
CONSTRAINT [PK_Encounters] PRIMARY KEY CLUSTERED
	(
	[id] ASC
	)WITH (IGNORE_DUP_KEY = OFF)
	)
END;
GO
