const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const port = 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id TEXT PRIMARY KEY,
        tipo_pessoa TEXT,
        nome TEXT,
        documento TEXT,
        rg TEXT,
        data_nascimento TEXT,
        sexo TEXT,
        telefone TEXT,
        telefone2 TEXT,
        email TEXT,
        cep TEXT,
        logradouro TEXT,
        numero TEXT,
        complemento TEXT,
        bairro TEXT,
        cidade TEXT,
        estado TEXT,
        observacoes TEXT,
        data_cadastro TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS veiculos (
        id TEXT PRIMARY KEY,
        placa TEXT,
        marca TEXT,
        modelo TEXT,
        ano TEXT,
        cor TEXT,
        tipo TEXT,
        cpf_proprietario TEXT,
        nome_proprietario TEXT,
        telefone_proprietario TEXT,
        email_proprietario TEXT,
        kilometragem TEXT,
        combustivel TEXT,
        observacoes TEXT,
        data_cadastro TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS estoque (
        id TEXT PRIMARY KEY,
        name TEXT,
        category TEXT,
        quantity INTEGER DEFAULT 0,
        unit TEXT,
        min_stock INTEGER DEFAULT 0,
        supplier TEXT,
        location TEXT,
        price DECIMAL(10,2) DEFAULT 0,
        notes TEXT
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS funcionarios (
        id TEXT PRIMARY KEY,
        nome TEXT,
        cpf TEXT,
        rg TEXT,
        data_nascimento TEXT,
        telefone TEXT,
        email TEXT,
        endereco TEXT,
        matricula TEXT UNIQUE,
        cargo TEXT,
        departamento TEXT,
        data_admissao TEXT,
        supervisor TEXT,
        turno TEXT,
        especializacoes JSONB DEFAULT '[]',
        salario TEXT,
        comissao TEXT,
        meta_servicos TEXT,
        meta_faturamento TEXT,
        banco TEXT,
        agencia TEXT,
        conta TEXT,
        usuario TEXT,
        nivel_acesso TEXT,
        permissoes JSONB DEFAULT '[]',
        observacoes TEXT,
        data_cadastro TIMESTAMP DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS ordens_servico (
        id TEXT PRIMARY KEY,
        os_number SERIAL,
        client JSONB,
        vehicle JSONB,
        dates JSONB,
        services JSONB DEFAULT '[]',
        payment TEXT,
        observations TEXT,
        total TEXT,
        status TEXT DEFAULT 'aguardando',
        progress INTEGER DEFAULT 0,
        timeline JSONB DEFAULT '[]'
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS agendamentos (
        id SERIAL PRIMARY KEY,
        date TEXT,
        time TEXT,
        client TEXT,
        vehicle TEXT,
        plate TEXT,
        service TEXT,
        service_name TEXT,
        responsible TEXT,
        responsible_name TEXT,
        status TEXT DEFAULT 'agendado',
        notes TEXT,
        os_number INTEGER
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tarefas (
        id TEXT PRIMARY KEY,
        titulo_tarefa TEXT,
        tipo_servico TEXT,
        prioridade TEXT,
        tempo_estimado TEXT,
        descricao TEXT,
        funcionario TEXT,
        data_agendamento TEXT,
        horario TEXT,
        supervisor TEXT,
        equipe_adicional JSONB DEFAULT '[]',
        cliente TEXT,
        veiculo TEXT,
        placa TEXT,
        cor TEXT,
        numero_os TEXT,
        observacoes_veiculo TEXT,
        materiais JSONB DEFAULT '[]',
        checklist JSONB DEFAULT '[]',
        valor_servico TEXT,
        comissao_funcionario TEXT,
        forma_pagamento TEXT,
        status_pagamento TEXT,
        instrucoes TEXT,
        observacoes_gerais TEXT,
        notificacoes JSONB DEFAULT '[]',
        data_cadastro TIMESTAMP DEFAULT NOW(),
        status TEXT DEFAULT 'Pendente'
      )
    `);

    const estoqueResult = await client.query("SELECT COUNT(*) FROM estoque");
    if (parseInt(estoqueResult.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO estoque (id, name, category, quantity, unit, min_stock) VALUES
        ('est1', 'Flanela de Microfibra', 'Acessórios', 15, 'un', 20),
        ('est2', 'Shampoo Automotivo', 'Limpeza', 8, 'lt', 5),
        ('est3', 'Vitrificador Cerâmico', 'Vitrificação', 12, 'un', 10)
      `);
    }

    const agendamentosResult = await client.query("SELECT COUNT(*) FROM agendamentos");
    if (parseInt(agendamentosResult.rows[0].count) === 0) {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
      
      await client.query(`
        INSERT INTO agendamentos (date, time, client, vehicle, plate, service, service_name, responsible, responsible_name, status, notes) VALUES
        ($1, '10:00', 'Carlos Santos', 'Corolla 2020', 'ABC-1234', 'polimento', 'Polimento Técnico', 'joao', 'João Silva', 'agendado', 'Cliente solicitou atenção especial no capô'),
        ($1, '14:00', 'Ana Paula', 'HR-V 2019', 'XYZ-9876', 'higienizacao', 'Higienização Interna', 'maria', 'Maria Santos', 'em-andamento', ''),
        ($2, '09:00', 'Roberto Lima', 'Civic 2021', 'DEF-5555', 'vitrificacao', 'Vitrificação', 'pedro', 'Pedro Costa', 'agendado', 'Primeira vitrificação do veículo')
      `, [todayStr, tomorrowStr]);
    }

    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Error initializing database:", err);
  } finally {
    client.release();
  }
}

function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

app.get("/api/clientes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM clientes ORDER BY data_cadastro DESC");
    const clientes = result.rows.map(row => ({
      id: row.id,
      tipoPessoa: row.tipo_pessoa,
      nome: row.nome,
      documento: row.documento,
      rg: row.rg,
      dataNascimento: row.data_nascimento,
      sexo: row.sexo,
      telefone: row.telefone,
      telefone2: row.telefone2,
      email: row.email,
      cep: row.cep,
      logradouro: row.logradouro,
      numero: row.numero,
      complemento: row.complemento,
      bairro: row.bairro,
      cidade: row.cidade,
      estado: row.estado,
      observacoes: row.observacoes,
      dataCadastro: row.data_cadastro
    }));
    res.json(clientes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/clientes", async (req, res) => {
  try {
    const id = gerarId();
    const b = req.body;
    await pool.query(`
      INSERT INTO clientes (id, tipo_pessoa, nome, documento, rg, data_nascimento, sexo, telefone, telefone2, email, cep, logradouro, numero, complemento, bairro, cidade, estado, observacoes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    `, [id, b.tipoPessoa, b.nome, b.documento, b.rg, b.dataNascimento, b.sexo, b.telefone, b.telefone2, b.email, b.cep, b.logradouro, b.numero, b.complemento, b.bairro, b.cidade, b.estado, b.observacoes]);
    res.json({ id, ...b, dataCadastro: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/clientes/:id", async (req, res) => {
  try {
    const b = req.body;
    await pool.query(`
      UPDATE clientes SET tipo_pessoa=$1, nome=$2, documento=$3, rg=$4, data_nascimento=$5, sexo=$6, telefone=$7, telefone2=$8, email=$9, cep=$10, logradouro=$11, numero=$12, complemento=$13, bairro=$14, cidade=$15, estado=$16, observacoes=$17
      WHERE id = $18
    `, [b.tipoPessoa, b.nome, b.documento, b.rg, b.dataNascimento, b.sexo, b.telefone, b.telefone2, b.email, b.cep, b.logradouro, b.numero, b.complemento, b.bairro, b.cidade, b.estado, b.observacoes, req.params.id]);
    res.json({ id: req.params.id, ...b });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/clientes/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM clientes WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/veiculos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM veiculos ORDER BY data_cadastro DESC");
    const veiculos = result.rows.map(row => ({
      id: row.id,
      placa: row.placa,
      marca: row.marca,
      modelo: row.modelo,
      ano: row.ano,
      cor: row.cor,
      tipo: row.tipo,
      cpfProprietario: row.cpf_proprietario,
      nomeProprietario: row.nome_proprietario,
      telefoneProprietario: row.telefone_proprietario,
      emailProprietario: row.email_proprietario,
      kilometragem: row.kilometragem,
      combustivel: row.combustivel,
      observacoes: row.observacoes,
      dataCadastro: row.data_cadastro
    }));
    res.json(veiculos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/veiculos", async (req, res) => {
  try {
    const id = gerarId();
    const b = req.body;
    await pool.query(`
      INSERT INTO veiculos (id, placa, marca, modelo, ano, cor, tipo, cpf_proprietario, nome_proprietario, telefone_proprietario, email_proprietario, kilometragem, combustivel, observacoes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [id, b.placa, b.marca, b.modelo, b.ano, b.cor, b.tipo, b.cpfProprietario, b.nomeProprietario, b.telefoneProprietario, b.emailProprietario, b.kilometragem, b.combustivel, b.observacoes]);
    res.json({ id, ...b, dataCadastro: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/veiculos/:id", async (req, res) => {
  try {
    const b = req.body;
    await pool.query(`
      UPDATE veiculos SET placa=$1, marca=$2, modelo=$3, ano=$4, cor=$5, tipo=$6, cpf_proprietario=$7, nome_proprietario=$8, telefone_proprietario=$9, email_proprietario=$10, kilometragem=$11, combustivel=$12, observacoes=$13
      WHERE id = $14
    `, [b.placa, b.marca, b.modelo, b.ano, b.cor, b.tipo, b.cpfProprietario, b.nomeProprietario, b.telefoneProprietario, b.emailProprietario, b.kilometragem, b.combustivel, b.observacoes, req.params.id]);
    res.json({ id: req.params.id, ...b });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/veiculos/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM veiculos WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/estoque", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM estoque");
    const estoque = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      category: row.category,
      quantity: row.quantity,
      unit: row.unit,
      minStock: row.min_stock,
      supplier: row.supplier,
      location: row.location,
      price: parseFloat(row.price) || 0,
      notes: row.notes
    }));
    res.json(estoque);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/estoque", async (req, res) => {
  try {
    const id = gerarId();
    const b = req.body;
    await pool.query(`
      INSERT INTO estoque (id, name, category, quantity, unit, min_stock, supplier, location, price, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [id, b.name, b.category, b.quantity, b.unit, b.minStock, b.supplier, b.location, b.price, b.notes]);
    res.json({ id, ...b });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/estoque/:id", async (req, res) => {
  try {
    const b = req.body;
    await pool.query(`
      UPDATE estoque SET name=$1, category=$2, quantity=$3, unit=$4, min_stock=$5, supplier=$6, location=$7, price=$8, notes=$9
      WHERE id = $10
    `, [b.name, b.category, b.quantity, b.unit, b.minStock, b.supplier, b.location, b.price, b.notes, req.params.id]);
    res.json({ id: req.params.id, ...b });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/estoque/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM estoque WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/funcionarios", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM funcionarios ORDER BY data_cadastro DESC");
    const funcionarios = result.rows.map(row => ({
      id: row.id,
      nome: row.nome,
      cpf: row.cpf,
      rg: row.rg,
      dataNascimento: row.data_nascimento,
      telefone: row.telefone,
      email: row.email,
      endereco: row.endereco,
      matricula: row.matricula,
      cargo: row.cargo,
      departamento: row.departamento,
      dataAdmissao: row.data_admissao,
      supervisor: row.supervisor,
      turno: row.turno,
      especializacoes: row.especializacoes || [],
      salario: row.salario,
      comissao: row.comissao,
      metaServicos: row.meta_servicos,
      metaFaturamento: row.meta_faturamento,
      banco: row.banco,
      agencia: row.agencia,
      conta: row.conta,
      usuario: row.usuario,
      nivelAcesso: row.nivel_acesso,
      permissoes: row.permissoes || [],
      observacoes: row.observacoes,
      dataCadastro: row.data_cadastro
    }));
    res.json(funcionarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/funcionarios", async (req, res) => {
  try {
    const id = gerarId();
    const b = req.body;
    await pool.query(`
      INSERT INTO funcionarios (id, nome, cpf, rg, data_nascimento, telefone, email, endereco, matricula, cargo, departamento, data_admissao, supervisor, turno, especializacoes, salario, comissao, meta_servicos, meta_faturamento, banco, agencia, conta, usuario, nivel_acesso, permissoes, observacoes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
    `, [id, b.nome, b.cpf, b.rg, b.dataNascimento, b.telefone, b.email, b.endereco, b.matricula, b.cargo, b.departamento, b.dataAdmissao, b.supervisor, b.turno, JSON.stringify(b.especializacoes || []), b.salario, b.comissao, b.metaServicos, b.metaFaturamento, b.banco, b.agencia, b.conta, b.usuario, b.nivelAcesso, JSON.stringify(b.permissoes || []), b.observacoes]);
    res.json({ id, ...b, dataCadastro: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/funcionarios/:id", async (req, res) => {
  try {
    const b = req.body;
    await pool.query(`
      UPDATE funcionarios SET nome=$1, cpf=$2, rg=$3, data_nascimento=$4, telefone=$5, email=$6, endereco=$7, matricula=$8, cargo=$9, departamento=$10, data_admissao=$11, supervisor=$12, turno=$13, especializacoes=$14, salario=$15, comissao=$16, meta_servicos=$17, meta_faturamento=$18, banco=$19, agencia=$20, conta=$21, usuario=$22, nivel_acesso=$23, permissoes=$24, observacoes=$25
      WHERE id = $26
    `, [b.nome, b.cpf, b.rg, b.dataNascimento, b.telefone, b.email, b.endereco, b.matricula, b.cargo, b.departamento, b.dataAdmissao, b.supervisor, b.turno, JSON.stringify(b.especializacoes || []), b.salario, b.comissao, b.metaServicos, b.metaFaturamento, b.banco, b.agencia, b.conta, b.usuario, b.nivelAcesso, JSON.stringify(b.permissoes || []), b.observacoes, req.params.id]);
    res.json({ id: req.params.id, ...b });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/funcionarios/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM funcionarios WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/ordens", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ordens_servico ORDER BY os_number DESC");
    const ordens = result.rows.map(row => ({
      id: row.id,
      osNumber: row.os_number,
      client: row.client,
      vehicle: row.vehicle,
      dates: row.dates,
      services: row.services || [],
      payment: row.payment,
      observations: row.observations,
      total: row.total,
      status: row.status,
      progress: row.progress,
      timeline: row.timeline || []
    }));
    res.json(ordens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/ordens", async (req, res) => {
  try {
    const id = gerarId();
    const b = req.body;
    const timeline = [{ event: "OS Criada", date: new Date().toLocaleString("pt-BR"), by: "Sistema" }];
    const result = await pool.query(`
      INSERT INTO ordens_servico (id, client, vehicle, dates, services, payment, observations, total, status, progress, timeline)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING os_number
    `, [id, JSON.stringify(b.client), JSON.stringify(b.vehicle), JSON.stringify(b.dates), JSON.stringify(b.services || []), b.payment, b.observations, b.total, b.status || "aguardando", b.progress || 0, JSON.stringify(timeline)]);
    res.json({ id, osNumber: result.rows[0].os_number, ...b, status: b.status || "aguardando", progress: b.progress || 0, timeline });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/ordens/:osNumber", async (req, res) => {
  try {
    const b = req.body;
    await pool.query(`
      UPDATE ordens_servico SET client=$1, vehicle=$2, dates=$3, services=$4, payment=$5, observations=$6, total=$7, status=$8, progress=$9, timeline=$10
      WHERE os_number = $11
    `, [JSON.stringify(b.client), JSON.stringify(b.vehicle), JSON.stringify(b.dates), JSON.stringify(b.services || []), b.payment, b.observations, b.total, b.status, b.progress, JSON.stringify(b.timeline || []), req.params.osNumber]);
    res.json({ osNumber: parseInt(req.params.osNumber), ...b });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/ordens/:osNumber", async (req, res) => {
  try {
    await pool.query("DELETE FROM ordens_servico WHERE os_number = $1", [req.params.osNumber]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/agendamentos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM agendamentos ORDER BY date, time");
    const agendamentos = result.rows.map(row => ({
      id: row.id,
      date: row.date,
      time: row.time,
      client: row.client,
      vehicle: row.vehicle,
      plate: row.plate,
      service: row.service,
      serviceName: row.service_name,
      responsible: row.responsible,
      responsibleName: row.responsible_name,
      status: row.status,
      notes: row.notes,
      osNumber: row.os_number
    }));
    res.json(agendamentos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/agendamentos", async (req, res) => {
  try {
    const b = req.body;
    const result = await pool.query(`
      INSERT INTO agendamentos (date, time, client, vehicle, plate, service, service_name, responsible, responsible_name, status, notes, os_number)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `, [b.date, b.time, b.client, b.vehicle, b.plate, b.service, b.serviceName, b.responsible, b.responsibleName, b.status || "agendado", b.notes, b.osNumber]);
    res.json({ id: result.rows[0].id, ...b });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/agendamentos/:id", async (req, res) => {
  try {
    const b = req.body;
    await pool.query(`
      UPDATE agendamentos SET date=$1, time=$2, client=$3, vehicle=$4, plate=$5, service=$6, service_name=$7, responsible=$8, responsible_name=$9, status=$10, notes=$11
      WHERE id = $12
    `, [b.date, b.time, b.client, b.vehicle, b.plate, b.service, b.serviceName, b.responsible, b.responsibleName, b.status, b.notes, req.params.id]);
    res.json({ id: parseInt(req.params.id), ...b });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/agendamentos/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM agendamentos WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/tarefas", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tarefas ORDER BY data_cadastro DESC");
    const tarefas = result.rows.map(row => ({
      id: row.id,
      tituloTarefa: row.titulo_tarefa,
      tipoServico: row.tipo_servico,
      prioridade: row.prioridade,
      tempoEstimado: row.tempo_estimado,
      descricao: row.descricao,
      funcionario: row.funcionario,
      dataAgendamento: row.data_agendamento,
      horario: row.horario,
      supervisor: row.supervisor,
      equipeAdicional: row.equipe_adicional || [],
      cliente: row.cliente,
      veiculo: row.veiculo,
      placa: row.placa,
      cor: row.cor,
      numeroOS: row.numero_os,
      observacoesVeiculo: row.observacoes_veiculo,
      materiais: row.materiais || [],
      checklist: row.checklist || [],
      valorServico: row.valor_servico,
      comissaoFuncionario: row.comissao_funcionario,
      formaPagamento: row.forma_pagamento,
      statusPagamento: row.status_pagamento,
      instrucoes: row.instrucoes,
      observacoesGerais: row.observacoes_gerais,
      notificacoes: row.notificacoes || [],
      dataCadastro: row.data_cadastro,
      status: row.status
    }));
    res.json(tarefas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/tarefas", async (req, res) => {
  try {
    const id = gerarId();
    const b = req.body;
    await pool.query(`
      INSERT INTO tarefas (id, titulo_tarefa, tipo_servico, prioridade, tempo_estimado, descricao, funcionario, data_agendamento, horario, supervisor, equipe_adicional, cliente, veiculo, placa, cor, numero_os, observacoes_veiculo, materiais, checklist, valor_servico, comissao_funcionario, forma_pagamento, status_pagamento, instrucoes, observacoes_gerais, notificacoes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
    `, [id, b.tituloTarefa, b.tipoServico, b.prioridade, b.tempoEstimado, b.descricao, b.funcionario, b.dataAgendamento, b.horario, b.supervisor, JSON.stringify(b.equipeAdicional || []), b.cliente, b.veiculo, b.placa, b.cor, b.numeroOS, b.observacoesVeiculo, JSON.stringify(b.materiais || []), JSON.stringify(b.checklist || []), b.valorServico, b.comissaoFuncionario, b.formaPagamento, b.statusPagamento, b.instrucoes, b.observacoesGerais, JSON.stringify(b.notificacoes || [])]);
    res.json({ id, ...b, dataCadastro: new Date().toISOString(), status: "Pendente" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/tarefas/:id", async (req, res) => {
  try {
    const b = req.body;
    await pool.query(`
      UPDATE tarefas SET titulo_tarefa=$1, tipo_servico=$2, prioridade=$3, tempo_estimado=$4, descricao=$5, funcionario=$6, data_agendamento=$7, horario=$8, supervisor=$9, equipe_adicional=$10, cliente=$11, veiculo=$12, placa=$13, cor=$14, numero_os=$15, observacoes_veiculo=$16, materiais=$17, checklist=$18, valor_servico=$19, comissao_funcionario=$20, forma_pagamento=$21, status_pagamento=$22, instrucoes=$23, observacoes_gerais=$24, notificacoes=$25, status=$26
      WHERE id = $27
    `, [b.tituloTarefa, b.tipoServico, b.prioridade, b.tempoEstimado, b.descricao, b.funcionario, b.dataAgendamento, b.horario, b.supervisor, JSON.stringify(b.equipeAdicional || []), b.cliente, b.veiculo, b.placa, b.cor, b.numeroOS, b.observacoesVeiculo, JSON.stringify(b.materiais || []), JSON.stringify(b.checklist || []), b.valorServico, b.comissaoFuncionario, b.formaPagamento, b.statusPagamento, b.instrucoes, b.observacoesGerais, JSON.stringify(b.notificacoes || []), b.status || "Pendente", req.params.id]);
    res.json({ id: req.params.id, ...b });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/tarefas/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM tarefas WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

initDatabase().then(() => {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
});
