export const rows = [
    {
      id: 1,
      project: "SOX FY Compliance",
      totalEffort: 25,
      W1:3,
      isGroup: true,
      children: [
        {
          id: 11,
          resource: "Amit Sharma",
          initials: "AS",
          color: "#F06292",
          role: "Senior Product Manager",
          totalEffort: 11,
          W1: 1, W2: 1, W3: 1, W4: 1, W5: 1, W6: 1, W7: 1, W8: 1, W9: 1, W10: 0.5, W11: 0.5, W12: 0.5, W13: 0.5, W14: 0.5, W15: 0.5
        },
        {
          id: 12,
          resource: "Nitin Kaushik",
          initials: "NK",
          color: "#42A5F5",
          role: "Product Designer",
          totalEffort: 7,
          W1: 1, W2: 1, W3: 1, W4: 1, W5: 1, W6: 1, W7: 1, W8: 1,
        },
        {
          id: 13,
          resource: "Hitesh Sharma",
          initials: "HS",
          color: "#42A5F5",
          role: "Developer",
          totalEffort: 7,
          W1: 1, W2: 1, W3: 1, W4: 1, W5: 1, W6: 1, W7: 1, W8: 1,
        },
      ],
    },
    {
      id: 2,
      project: "Website Revamp",
      isGroup: true,
      children: [
        {
          id: 21,
          resource: "Naveen Sharma",
          initials: "NS",
          color: "#E57373",
          role: "Senior Product Manager",
          totalEffort: 11,
          W1: 1, W2: 1, W3: 1, W4: 1, W5: 1, W6: 1, W7: 1, W8: 1, W9: 1,
        },
        {
          id: 22,
          resource: "Naman Kaushik",
          initials: "NK",
          color: "#FFB74D",
          role: "Product Designer",
          totalEffort: 7,
          W1: 1, W2: 1, W3: 1, W4: 1, W5: 1, W6: 1, W7: 1, W8: 1,
        },
      ],
    },
  ];
  
  
  export const demoRows = [
    {
      "id": "64df427e-75ed-5be5-8d6f-4a56aef066e1",
      "project": "Corn",
      "resource": "Augusta Norman",
      "role": "Trader",
      "totalEffort": 100, // Add total effort for the object
      "W1": 10,
      "W2": 12,
      "W3": 15,
      "W4": 20,
      "W5": 18,
      "W6": 10,
      "W7": 5,
      "W8": 8,
      "W9": 7,
      "W10": 9,
      "W11": 6,
      "W12": 7,
      "W13": 6,
      "W14": 5,
      "W15": 3,
      "hasButton": false, // Optional button flag
    },
    {
      "id": "14af22ff-c624-5ff2-9c97-c7620bf738c3",
      "project": "Frozen Concentrated Orange Juice",
      "resource": "Flora Dixon",
      "role": "Trader",
      "totalEffort": 120, // Add total effort for the object
      "W1": 14,
      "W2": 17,
      "W3": 20,
      "W4": 25,
      "W5": 16,
      "W6": 15,
      "W7": 7,
      "W8": 10,
      "W9": 5,
      "W10": 7,
      "W11": 6,
      "W12": 9,
      "W13": 7,
      "W14": 10,
      "W15": 8,
      "hasButton": false, // Optional button flag
    },
    {
      "id": "066b8c25-8bd5-5c9f-9851-31526d96a8e2",
      "project": "Sugar No.11",
      "resource": "Resource 2",
      "role": "Analyst",
      "totalEffort": 80, // Total effort
      "W1": 9,
      "W2": 19,
      "W3": 14,
      "W4": 11,
      "W5": 12,
      "W6": 10,
      "W7": 13,
      "W8": 14,
      "W9": 12,
      "W10": 16,
      "W11": 11,
      "W12": 13,
      "W13": 10,
      "W14": 12,
      "W15": 14,
      "hasButton": false,
    }
  ];
  
  export const jsonData = {
    organizations: [
      {
        name: "Quarks Technosoft",
        totalHours: 100,
        resources: [
          {
            name: "Amit Sharma",
            projects: ["Network 18", "Adani", "MFB"],
            totalHours: 40,
            weeklyHours: {
              "Jan W1": 10,
              "W2": 10,
              "W3": 10,
              "W4": 20,
            },
          },
          {
            name: "Nitin Kaushik",
            projects: ["Network 18"],
            totalHours: 20,
            weeklyHours: {
              "W1": 2,
              "W2": 2,
              "W3": 2,
              "W4": 2,
              "W1": 2,
              "W2": 2,
              "W3": 2,
              "W4": 2,
              "W1": 2,
              "W2": 2,
            },
          },
        ],
      },
      {
        name: "KBI Partners",
        totalHours: 100,
        resources: [
          {
            name: "Amit Sharma",
            projects: ["Network 18", "Adani", "MFB"],
            totalHours: 40,
            weeklyHours: {
              "W1": 10,
              "W2": 10,
              "W3": 10,
              "W4": 10,
            },
          },
          {
            name: "Nitin Kaushik",
            projects: ["Network 18"],
            totalHours: 20,
            weeklyHours: {
              "W1": 2,
              "W2": 2,
              "W3": 2,
              "W4": 2,
              "W1": 2,
              "W2": 2,
              "W3": 2,
              "W4": 2,
              "W1": 2,
              "W2": 2,
            },
          },
        ],
      },
    ],
  };
  
  // Predefined list of available resources
  export const allResources = [
    { name: "John Doe", projects: ["Project A"], totalHours: 30 },
    { name: "Jane Smith", projects: ["Project B"], totalHours: 25 },
    { name: "Alice Johnson", projects: ["Project C"], totalHours: 35 },
  ];