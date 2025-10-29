export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      employee_titles: {
        Row: {
          created_at: string;
          created_by: string | null;
          employee_id: string;
          end_date: string | null;
          id: string;
          modified_at: string;
          modified_by: string | null;
          start_date: string;
          title_id: string;
          title_status: Database["public"]["Enums"]["title_status"];
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          employee_id: string;
          end_date?: string | null;
          id?: string;
          modified_at?: string;
          modified_by?: string | null;
          start_date: string;
          title_id: string;
          title_status: Database["public"]["Enums"]["title_status"];
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          employee_id?: string;
          end_date?: string | null;
          id?: string;
          modified_at?: string;
          modified_by?: string | null;
          start_date?: string;
          title_id?: string;
          title_status?: Database["public"]["Enums"]["title_status"];
        };
        Relationships: [
          {
            foreignKeyName: "employee_titles_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "employee_titles_title_id_fkey";
            columns: ["title_id"];
            isOneToOne: false;
            referencedRelation: "titles";
            referencedColumns: ["id"];
          },
        ];
      };
      employees: {
        Row: {
          birth_date: string;
          cell_phone: string | null;
          created_at: string;
          created_by: string | null;
          csc_id: string | null;
          email_address: string | null;
          first_name: string;
          home_address: string;
          home_phone: string | null;
          id: string;
          is_default_cto: boolean;
          last_name: string;
          mailing_address: string | null;
          middle_name: string | null;
          modified_at: string;
          modified_by: string | null;
          pers_membership_number: string | null;
          pers_tier: string | null;
          photo_url: string | null;
          ssn_hash: string;
          user_id: string | null;
        };
        Insert: {
          birth_date: string;
          cell_phone?: string | null;
          created_at?: string;
          created_by?: string | null;
          csc_id?: string | null;
          email_address?: string | null;
          first_name: string;
          home_address: string;
          home_phone?: string | null;
          id?: string;
          is_default_cto?: boolean;
          last_name: string;
          mailing_address?: string | null;
          middle_name?: string | null;
          modified_at?: string;
          modified_by?: string | null;
          pers_membership_number?: string | null;
          pers_tier?: string | null;
          photo_url?: string | null;
          ssn_hash: string;
          user_id?: string | null;
        };
        Update: {
          birth_date?: string;
          cell_phone?: string | null;
          created_at?: string;
          created_by?: string | null;
          csc_id?: string | null;
          email_address?: string | null;
          first_name?: string;
          home_address?: string;
          home_phone?: string | null;
          id?: string;
          is_default_cto?: boolean;
          last_name?: string;
          mailing_address?: string | null;
          middle_name?: string | null;
          modified_at?: string;
          modified_by?: string | null;
          pers_membership_number?: string | null;
          pers_tier?: string | null;
          photo_url?: string | null;
          ssn_hash?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      holiday_dates: {
        Row: {
          created_at: string;
          created_by: string | null;
          holiday_date: string;
          holiday_id: string;
          id: string;
          modified_at: string;
          modified_by: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          holiday_date: string;
          holiday_id: string;
          id?: string;
          modified_at?: string;
          modified_by?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          holiday_date?: string;
          holiday_id?: string;
          id?: string;
          modified_at?: string;
          modified_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "holiday_dates_holiday_id_fkey";
            columns: ["holiday_id"];
            isOneToOne: false;
            referencedRelation: "holidays";
            referencedColumns: ["id"];
          },
        ];
      };
      holidays: {
        Row: {
          created_at: string;
          created_by: string | null;
          definition: string;
          id: string;
          is_active: boolean;
          is_function_available: boolean;
          modified_at: string;
          modified_by: string | null;
          name: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          definition: string;
          id?: string;
          is_active?: boolean;
          is_function_available?: boolean;
          modified_at?: string;
          modified_by?: string | null;
          name: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          definition?: string;
          id?: string;
          is_active?: boolean;
          is_function_available?: boolean;
          modified_at?: string;
          modified_by?: string | null;
          name?: string;
        };
        Relationships: [];
      };
      pay_periods: {
        Row: {
          begin_date: string;
          created_at: string;
          created_by: string | null;
          end_date: string;
          id: string;
          modified_at: string;
          modified_by: string | null;
          pay_date: string;
          pay_period_number: number;
          payroll_year: number;
        };
        Insert: {
          begin_date: string;
          created_at?: string;
          created_by?: string | null;
          end_date: string;
          id?: string;
          modified_at?: string;
          modified_by?: string | null;
          pay_date: string;
          pay_period_number: number;
          payroll_year: number;
        };
        Update: {
          begin_date?: string;
          created_at?: string;
          created_by?: string | null;
          end_date?: string;
          id?: string;
          modified_at?: string;
          modified_by?: string | null;
          pay_date?: string;
          pay_period_number?: number;
          payroll_year?: number;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
        };
        Relationships: [];
      };
      starting_balances: {
        Row: {
          created_at: string;
          created_by: string | null;
          employee_id: string;
          id: string;
          modified_at: string;
          modified_by: string | null;
          payroll_year: number;
          starting_balance: number;
          time_type_id: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          employee_id: string;
          id?: string;
          modified_at?: string;
          modified_by?: string | null;
          payroll_year: number;
          starting_balance?: number;
          time_type_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          employee_id?: string;
          id?: string;
          modified_at?: string;
          modified_by?: string | null;
          payroll_year?: number;
          starting_balance?: number;
          time_type_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "starting_balances_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "starting_balances_time_type_id_fkey";
            columns: ["time_type_id"];
            isOneToOne: false;
            referencedRelation: "time_types";
            referencedColumns: ["id"];
          },
        ];
      };
      time_types: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          is_paid: boolean;
          modified_at: string;
          modified_by: string | null;
          type_name: string;
          type_short_name: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_paid: boolean;
          modified_at?: string;
          modified_by?: string | null;
          type_name: string;
          type_short_name: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          id?: string;
          is_paid?: boolean;
          modified_at?: string;
          modified_by?: string | null;
          type_name?: string;
          type_short_name?: string;
        };
        Relationships: [];
      };
      timesheet_employee_times: {
        Row: {
          created_at: string;
          created_by: string | null;
          hours_amount: number;
          id: string;
          modified_at: string;
          modified_by: string | null;
          time_type_id: string;
          timesheet_employee_id: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          hours_amount?: number;
          id?: string;
          modified_at?: string;
          modified_by?: string | null;
          time_type_id: string;
          timesheet_employee_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          hours_amount?: number;
          id?: string;
          modified_at?: string;
          modified_by?: string | null;
          time_type_id?: string;
          timesheet_employee_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "timesheet_employee_times_time_type_id_fkey";
            columns: ["time_type_id"];
            isOneToOne: false;
            referencedRelation: "time_types";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName:
              "timesheet_employee_times_timesheet_employee_id_fkey";
            columns: ["timesheet_employee_id"];
            isOneToOne: false;
            referencedRelation: "timesheet_employees";
            referencedColumns: ["id"];
          },
        ];
      };
      timesheet_employees: {
        Row: {
          created_at: string;
          created_by: string | null;
          employee_id: string;
          id: string;
          is_late: boolean;
          modified_at: string;
          modified_by: string | null;
          notes: string | null;
          timesheet_id: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          employee_id: string;
          id?: string;
          is_late?: boolean;
          modified_at?: string;
          modified_by?: string | null;
          notes?: string | null;
          timesheet_id: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          employee_id?: string;
          id?: string;
          is_late?: boolean;
          modified_at?: string;
          modified_by?: string | null;
          notes?: string | null;
          timesheet_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "timesheet_employees_employee_id_fkey";
            columns: ["employee_id"];
            isOneToOne: false;
            referencedRelation: "employees";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "timesheet_employees_timesheet_id_fkey";
            columns: ["timesheet_id"];
            isOneToOne: false;
            referencedRelation: "timesheets";
            referencedColumns: ["id"];
          },
        ];
      };
      timesheets: {
        Row: {
          created_at: string;
          created_by: string | null;
          holiday_date_id: string | null;
          id: string;
          modified_at: string;
          modified_by: string | null;
          notes: string | null;
          pay_period_id: string;
          timesheet_date: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          holiday_date_id?: string | null;
          id?: string;
          modified_at?: string;
          modified_by?: string | null;
          notes?: string | null;
          pay_period_id: string;
          timesheet_date: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          holiday_date_id?: string | null;
          id?: string;
          modified_at?: string;
          modified_by?: string | null;
          notes?: string | null;
          pay_period_id?: string;
          timesheet_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: "timesheets_holiday_date_id_fkey";
            columns: ["holiday_date_id"];
            isOneToOne: false;
            referencedRelation: "holiday_dates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "timesheets_pay_period_id_fkey";
            columns: ["pay_period_id"];
            isOneToOne: false;
            referencedRelation: "pay_periods";
            referencedColumns: ["id"];
          },
        ];
      };
      titles: {
        Row: {
          created_at: string;
          created_by: string | null;
          csc_code: string;
          csc_description_url: string | null;
          id: string;
          is_clerical: boolean;
          is_salaried: boolean;
          maximum_annual_salary: number | null;
          minimum_annual_salary: number | null;
          modified_at: string;
          modified_by: string | null;
          title_description_url: string | null;
          title_name: string;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          csc_code: string;
          csc_description_url?: string | null;
          id?: string;
          is_clerical?: boolean;
          is_salaried?: boolean;
          maximum_annual_salary?: number | null;
          minimum_annual_salary?: number | null;
          modified_at?: string;
          modified_by?: string | null;
          title_description_url?: string | null;
          title_name: string;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          csc_code?: string;
          csc_description_url?: string | null;
          id?: string;
          is_clerical?: boolean;
          is_salaried?: boolean;
          maximum_annual_salary?: number | null;
          minimum_annual_salary?: number | null;
          modified_at?: string;
          modified_by?: string | null;
          title_description_url?: string | null;
          title_name?: string;
        };
        Relationships: [];
      };
      user_permissions: {
        Row: {
          created_at: string;
          id: string;
          permission_name: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          permission_name: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          permission_name?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_permissions_permission_name_fkey";
            columns: ["permission_name"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      decrypt_ssn: {
        Args: { p_employee_id: string };
        Returns: string;
      };
      employee_user_id: {
        Args: { p_employee_id: string };
        Returns: string;
      };
      get_employee_id: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      has_permission: {
        Args: { p_permission_name: string };
        Returns: boolean;
      };
      verify_timesheet_date: {
        Args: { p_pay_period_id: string; p_timesheet_date: string };
        Returns: boolean;
      };
    };
    Enums: {
      title_status:
        | "permanent"
        | "part-time"
        | "seasonal"
        | "provisional"
        | "volunteer";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema =
  DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  } ? keyof (
      & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
        "Tables"
      ]
      & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
        "Views"
      ]
    )
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
} ? (
    & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
      "Tables"
    ]
    & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
      "Views"
    ]
  )[TableName] extends {
    Row: infer R;
  } ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (
    & DefaultSchema["Tables"]
    & DefaultSchema["Views"]
  ) ? (
      & DefaultSchema["Tables"]
      & DefaultSchema["Views"]
    )[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    } ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
      "Tables"
    ]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
    "Tables"
  ][TableName] extends {
    Insert: infer I;
  } ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    } ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
      "Tables"
    ]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
    "Tables"
  ][TableName] extends {
    Update: infer U;
  } ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    } ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]][
      "Enums"
    ]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][
    EnumName
  ]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[
      PublicCompositeTypeNameOrOptions["schema"]
    ]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]][
    "CompositeTypes"
  ][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      title_status: [
        "permanent",
        "part-time",
        "seasonal",
        "provisional",
        "volunteer",
      ],
    },
  },
} as const;
