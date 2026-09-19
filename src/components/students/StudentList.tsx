'use client';

import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlass,
  Plus,
  FileArrowUp,
  DownloadSimple
} from '@phosphor-icons/react';

import { useRouter, useSearchParams } from 'next/navigation';
import { useStudents } from '@/hooks/useStudents';
import { StudentTable } from './StudentTable';
import { StudentAddModal } from './StudentAddModal';
import { StudentEditModal } from './StudentEditModal';
import { StudentBulkModal } from './StudentBulkModal';
import { Student } from '@/types/models';
import { useGlobalSearch } from '@/context/SearchContext';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { isLocalScope } from '@/lib/roles';

interface StudentListProps {
  initialStudents: Student[];
  chapters: { id: string; name: string }[];
  regions: { id: string; name: string }[];
  role: string | null;
}

export default function StudentList({ initialStudents, chapters, regions, role }: StudentListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSubmitting, handleSearch, createStudent, updateStudent, deleteStudent, bulkUploadStudents } = useStudents();
  
  // Filter states
  const [filterRegion, setFilterRegion] = useState(searchParams.get('regionId') || '');
  const [filterChapter, setFilterChapter] = useState(searchParams.get('chapterId') || '');
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '');
  const [filterLevel, setFilterLevel] = useState(searchParams.get('level') || '');
  const [filterDept, setFilterDept] = useState(searchParams.get('dept') || '');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [newMember, setNewMember] = useState({ 
    name: '', studentId: '', chapterId: '', email: '', phone: '', department: '', levelYear: '',
    address: '', nextOfKinName: '', nextOfKinPhone: '', isLeader: false, position: '', status: 'ACTIVE', maxLevel: '400'
  });

  const { searchQuery } = useGlobalSearch();

  useEffect(() => {
    const current = searchParams.get('search') ?? '';
    if (searchQuery !== current) {
      handleSearch(searchQuery);
    }
  }, [searchQuery, searchParams, handleSearch]);

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    
    if (key === 'regionId') {
      params.delete('chapterId');
      setFilterChapter('');
    }
    
    router.replace(`/students?${params.toString()}`);
  };

  useEffect(() => {
    if (chapters.length === 1 && !newMember.chapterId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNewMember(prev => ({ ...prev, chapterId: chapters[0].id }));
    }
  }, [chapters, newMember.chapterId]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await createStudent(newMember)) {
      setShowAddModal(false);
      setNewMember({ 
        name: '', studentId: '', chapterId: chapters.length === 1 ? chapters[0].id : '',
        email: '', phone: '', department: '', levelYear: '', address: '',
        nextOfKinName: '', nextOfKinPhone: '', isLeader: false, position: '', status: 'ACTIVE', maxLevel: '400'
      });
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent && await updateStudent(editingStudent.id, editingStudent)) {
      setShowEditModal(false);
      setEditingStudent(null);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkFile && await bulkUploadStudents(bulkFile)) {
      setShowBulkModal(false);
      setBulkFile(null);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "studentId,name,email,phone,department,levelYear,maxLevel,status,isLeader,position\nUEB3227523,Bernard Akoto,ben@example.com,+233256494710,IT,Level 400,400,ACTIVE,true,President\nUEB3227524,Ama Serwaa,ama@example.com,+233256494711,Medicine,Level 100,700,ACTIVE,false,";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'u-chms_student_import.csv';
    a.click();
  };

  const handleExportExcel = () => {
    // 1. Group active/filtered student list by Region, then by Chapter
    const regionsMap: { [regionName: string]: { [instName: string]: Student[] } } = {};

    initialStudents.forEach(student => {
      const regionName = student.chapter?.region?.name || 'All Regions';
      const instName = student.chapter?.name || 'Unassigned';

      if (!regionsMap[regionName]) {
        regionsMap[regionName] = {};
      }
      if (!regionsMap[regionName][instName]) {
        regionsMap[regionName][instName] = [];
      }
      regionsMap[regionName][instName].push(student);
    });

    // 2. Build XML Spreadsheet 2003 string with custom styling blocks
    let xml = `<?xml version="1.0"?>
<?excel-sheet-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
  <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
    <Author>CASA UENR National Administration</Author>
    <Created>${new Date().toISOString()}</Created>
  </DocumentProperties>
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Borders/>
      <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Color="#0F172A"/>
      <Interior/>
      <NumberFormat/>
      <Protection/>
    </Style>
    <Style ss:ID="InstHeaderStyle">
      <Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#1E67FC"/>
      <Interior ss:Color="#EBF2FF" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#CBD5E1"/>
      </Borders>
    </Style>
    <Style ss:ID="TableHeaderStyle">
      <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#0F172A" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center"/>
    </Style>
    <Style ss:ID="DataStyle">
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
    </Style>
    <Style ss:ID="CodeStyle">
      <Font ss:FontName="Courier New" ss:Size="9" ss:Bold="1" ss:Color="#475569"/>
      <Interior ss:Color="#E2E8F0" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
    </Style>
    <Style ss:ID="LeaderBadgeStyle">
      <Font ss:FontName="Segoe UI" ss:Size="9" ss:Bold="1" ss:Color="#15803D"/>
      <Interior ss:Color="#E2E8F0" ss:Pattern="Solid"/>
      <Alignment ss:Horizontal="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
    </Style>
  </Styles>\n`;

    const regionNames = Object.keys(regionsMap).sort();
    if (regionNames.length === 0) {
      xml += `  <Worksheet ss:Name="Empty Directory">
    <Table>
      <Row><Cell><Data ss:Type="String">No registered members found.</Data></Cell></Row>
    </Table>
  </Worksheet>\n`;
    } else {
      regionNames.forEach(regionName => {
        // Sanitize tab names (cannot exceed 31 chars or contain special symbols)
        const sanitizedSheet = regionName.replace(/[\\/?*\[\]]/g, '').substring(0, 31) || 'Region';
        
        xml += `  <Worksheet ss:Name="${sanitizedSheet}">
    <Table ss:DefaultColumnWidth="120">
      <Column ss:Width="90"/> <!-- Student ID -->
      <Column ss:Width="160"/> <!-- Full Name -->
      <Column ss:Width="200"/> <!-- Email Address -->
      <Column ss:Width="110"/> <!-- Phone -->
      <Column ss:Width="95"/> <!-- Academic Level -->
      <Column ss:Width="160"/> <!-- Department -->
      <Column ss:Width="80"/> <!-- Status -->
      <Column ss:Width="160"/> <!-- Leadership -->\n`;

        const instMap = regionsMap[regionName];
        const instNames = Object.keys(instMap).sort();

        instNames.forEach(instName => {
          const instStudents = instMap[instName];

          // Chapter Header Title Row
          xml += `      <Row ss:Height="26">
        <Cell ss:MergeAcross="7" ss:StyleID="InstHeaderStyle">
          <Data ss:Type="String">  CHAPTER: ${instName.toUpperCase()} (${instStudents.length} Members)</Data>
        </Cell>
      </Row>\n`;

          // Header Row
          xml += `      <Row ss:Height="22" ss:StyleID="TableHeaderStyle">
        <Cell><Data ss:Type="String">STUDENT ID</Data></Cell>
        <Cell><Data ss:Type="String">FULL NAME</Data></Cell>
        <Cell><Data ss:Type="String">EMAIL ADDRESS</Data></Cell>
        <Cell><Data ss:Type="String">PHONE NUMBER</Data></Cell>
        <Cell><Data ss:Type="String">ACADEMIC LEVEL</Data></Cell>
        <Cell><Data ss:Type="String">DEPARTMENT</Data></Cell>
        <Cell><Data ss:Type="String">STATUS</Data></Cell>
        <Cell><Data ss:Type="String">LEADERSHIP ROLE</Data></Cell>
      </Row>\n`;

          // Student Row Items
          instStudents.forEach(student => {
            const isAlumni = student.status === 'ALUMNI' || 
                             student.status === 'GRADUATED' || 
                             student.levelYear === 'Post-Grad' || 
                             student.levelYear === 'Alumni' || 
                             (student.levelYear ? parseInt(student.levelYear) > 400 : false);

            const displayStatus = isAlumni ? 'ALUMNI' : student.status;
            const roleLabel = student.isLeader ? (student.position || 'Chapel Leader') : 'Member';
            
            xml += `      <Row ss:Height="20" ss:StyleID="DataStyle">
        <Cell ss:StyleID="CodeStyle"><Data ss:Type="String">${student.studentId}</Data></Cell>
        <Cell><Data ss:Type="String">${student.name}</Data></Cell>
        <Cell><Data ss:Type="String">${student.email || 'N/A'}</Data></Cell>
        <Cell><Data ss:Type="String">${student.phone || 'N/A'}</Data></Cell>
        <Cell><Data ss:Type="String">${student.levelYear || 'N/A'}</Data></Cell>
        <Cell><Data ss:Type="String">${student.department || 'N/A'}</Data></Cell>
        <Cell><Data ss:Type="String">${displayStatus}</Data></Cell>
        <Cell ss:StyleID="${(student.isLeader && !isAlumni) ? 'LeaderBadgeStyle' : 'DataStyle'}">
          <Data ss:Type="String">${roleLabel}</Data>
        </Cell>
      </Row>\n`;
          });

          // Empty divider spacing row between chapter list groups
          xml += `      <Row ss:Height="16"></Row>\n`;
        });

        xml += `    </Table>
  </Worksheet>\n`;
      });
    }

    xml += `</Workbook>`;

    // 3. Initiate the Spreadsheet download blob
    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `u-chms_members_directory_${new Date().toISOString().split('T')[0]}.xls`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 w-full stagger-fade-in">
      <header className="premium-header !mb-0 !pb-6">
        <div className="header-content-root">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F172A] tracking-tight leading-none">Members</h1>
            <p className="text-xs uppercase font-black text-slate-500 tracking-widest mt-2.5">Manage members</p>
          </div>

          <div className="actions-cluster">
            <button className="btn-glass-alt" onClick={handleExportExcel}>
              <DownloadSimple size={18} weight="duotone" />
              <span>Export Excel</span>
            </button>
            {isLocalScope(role) && (
              <>
                <button className="btn-glass-alt" onClick={() => setShowBulkModal(true)}><FileArrowUp size={18} weight="duotone" /><span>Bulk Import</span></button>
                <button className="btn-lux-primary" onClick={() => setShowAddModal(true)}><Plus size={18} weight="duotone" /><span>Add Member</span></button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Sleek Standard Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white border border-black/5 p-4 mb-6">
        {/* Department Search Field */}
        <div className="relative w-full lg:w-[280px]">
          <MagnifyingGlass size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" weight="duotone" />
          <input 
            type="text" 
            placeholder="Search department..." 
            value={filterDept}
            onChange={(e) => { setFilterDept(e.target.value); updateFilters('dept', e.target.value); }}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-black/5 focus:outline-none focus:border-[#1E67FC] transition-all font-extrabold text-sm text-[#0F172A] placeholder-slate-400"
          />
        </div>

        {/* Dropdown Selectors and Reset Button */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            {role === 'NATIONAL_ADMIN' && (
            <CustomDropdown 
              placeholder="All Regions"
              value={filterRegion}
              onChange={(val) => { setFilterRegion(val); updateFilters('regionId', val); }}
              options={[
                { label: 'All Regions', value: '' },
                ...regions.map(r => ({ label: r.name, value: r.id }))
              ]}
              className="w-full sm:w-[150px] !space-y-0"
            />
          )}

          {(role === 'NATIONAL_ADMIN' || role === 'REGIONAL_ADMIN') && (
            <CustomDropdown 
              placeholder="All Chapters"
              value={filterChapter}
              onChange={(val) => { setFilterChapter(val); updateFilters('chapterId', val); }}
              options={[
                { label: 'All Chapters', value: '' },
                ...chapters.map(ch => ({ label: ch.name, value: ch.id }))
              ]}
              className="w-full sm:w-[180px] !space-y-0"
            />
          )}

          <CustomDropdown 
            placeholder="Status"
            value={filterStatus}
            onChange={(val) => { setFilterStatus(val); updateFilters('status', val); }}
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'Active', value: 'ACTIVE' },
              { label: 'Inactive', value: 'INACTIVE' },
              { label: 'Graduated', value: 'GRADUATED' }
            ]}
            className="w-full sm:w-[140px] !space-y-0"
          />

          <CustomDropdown 
            placeholder="Level/Year"
            value={filterLevel}
            onChange={(val) => { setFilterLevel(val); updateFilters('level', val); }}
            options={[
              { label: 'All Levels', value: '' },
              { label: 'Level 100', value: '100' },
              { label: 'Level 200', value: '200' },
              { label: 'Level 300', value: '300' },
              { label: 'Level 400', value: '400' },
              { label: 'Level 500', value: '500' },
              { label: 'Level 600', value: '600' },
              { label: 'Level 700', value: '700' }
            ]}
            className="w-full sm:w-[140px] !space-y-0"
          />

          {(filterRegion || filterChapter || filterStatus || filterLevel || filterDept) && (
            <button 
              onClick={() => {
                setFilterRegion('');
                setFilterChapter('');
                setFilterStatus('');
                setFilterLevel('');
                setFilterDept('');
                router.replace('/students');
              }}
              className="px-4 py-2.5 text-slate-400 hover:text-[#1E67FC] hover:bg-[#1E67FC]/10 font-black text-xs uppercase tracking-widest transition-all shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <StudentTable 
        students={initialStudents} 
        role={role} 
        onEdit={(s) => { setEditingStudent(s); setShowEditModal(true); }}
        onDelete={deleteStudent} 
        searchQuery={searchQuery}
      />

      <StudentAddModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSubmit={handleCreateSubmit}
        newMember={newMember} 
        setNewMember={setNewMember} 
        chapters={chapters} 
        isSubmitting={isSubmitting}
      />

      <StudentEditModal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        onSubmit={handleUpdateSubmit}
        editingStudent={editingStudent} 
        setEditingStudent={setEditingStudent} 
        isSubmitting={isSubmitting}
      />

      <StudentBulkModal 
        isOpen={showBulkModal} 
        onClose={() => setShowBulkModal(false)} 
        onSubmit={handleBulkSubmit}
        bulkFile={bulkFile} 
        setBulkFile={setBulkFile} 
        onDownloadTemplate={downloadTemplate} 
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
